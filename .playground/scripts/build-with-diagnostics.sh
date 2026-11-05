#!/usr/bin/env bash
# Run from the deployed playground directory. No environment or command-line dumps.
set -Eeuo pipefail

started_at=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
monitor_pid=
stage=setup

heading() { printf '\n[ui-memory] %s | %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }

cgroup_memory() {
  local relative directory file
  [[ -r /proc/self/cgroup ]] || return 0
  if [[ -r /sys/fs/cgroup/cgroup.controllers ]]; then
    relative=$(awk -F: '$1 == "0" { print $3 }' /proc/self/cgroup)
    directory="/sys/fs/cgroup${relative}"
    # Include ancestors: an enclosing user/session slice may enforce the limit.
    while [[ "$directory" == /sys/fs/cgroup* ]]; do
      if [[ -d "$directory" ]]; then
        for file in memory.current memory.peak memory.max memory.high memory.swap.current memory.swap.max memory.events; do
          if [[ -r "$directory/$file" ]]; then
            printf '[ui-memory] %s: ' "$directory/$file"
            tr '\n' ' ' < "$directory/$file"
            printf '\n'
          fi
        done
      fi
      [[ "$directory" == /sys/fs/cgroup ]] && break
      directory=${directory%/*}
    done
  else
    relative=$(awk -F: '$2 ~ /(^|,)memory(,|$)/ { print $3 }' /proc/self/cgroup)
    directory="/sys/fs/cgroup/memory${relative}"
    while [[ "$directory" == /sys/fs/cgroup/memory* ]]; do
      for file in memory.usage_in_bytes memory.max_usage_in_bytes memory.limit_in_bytes memory.failcnt memory.oom_control; do
        if [[ -r "$directory/$file" ]]; then
          printf '[ui-memory] %s: ' "$directory/$file"
          tr '\n' ' ' < "$directory/$file"
          printf '\n'
        fi
      done
      [[ "$directory" == /sys/fs/cgroup/memory ]] && break
      directory=${directory%/*}
    done
  fi
}

snapshot() {
  heading "$*"
  free -m || true
  # RSS is KiB; comm avoids exposing secrets in process arguments.
  ps -eo pid,ppid,rss,%mem,comm --sort=-rss | head -n 16 || true
  if [[ -r /proc/vmstat ]]; then
    grep -E '^(oom_kill|pgmajfault|pswpin|pswpout) ' /proc/vmstat || true
  fi
  if [[ -r /proc/pressure/memory ]]; then
    printf '[ui-memory] memory pressure: '
    tr '\n' ' ' < /proc/pressure/memory
    printf '\n'
  fi
  cgroup_memory || true
}

pm2_summary() {
  heading 'PM2 app names, memory, and actual executable paths (no app environment/arguments)'
  node <<'JS' || true
const fs = require("node:fs")
const path = require("node:path")
const os = require("node:os")
const { execFileSync } = require("node:child_process")
const socket = path.join(process.env.PM2_HOME || path.join(os.homedir(), ".pm2"), "rpc.sock")
// Do not start a PM2 daemon just to gather diagnostics.
if (!fs.existsSync(socket)) {
  console.log("[ui-memory] No existing PM2 socket for this user; skipping app lookup")
} else {
  try {
    const apps = JSON.parse(execFileSync("pm2", ["jlist"], {
      timeout: 5000, maxBuffer: 4 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
    }))
    for (const app of apps) {
      let executable = "unavailable"
      try { executable = fs.readlinkSync(`/proc/${app.pid}/exe`) } catch {}
      console.log(JSON.stringify({
        name: app.name, pid: app.pid, status: app.pm2_env?.status,
        rssMiB: Math.round((app.monit?.memory || 0) / 1048576), executable,
        configuredInterpreter: app.pm2_env?.exec_interpreter,
        reportedNodeVersion: app.pm2_env?.node_version,
        restarts: app.pm2_env?.restart_time,
      }))
    }
  } catch {
    console.log("[ui-memory] PM2 app lookup unavailable; continuing without it")
  }
}
JS
}

finish() {
  local status=$?
  trap - EXIT
  set +e
  if [[ -n "$monitor_pid" ]]; then
    kill "$monitor_pid" 2>/dev/null
    wait "$monitor_pid" 2>/dev/null
  fi
  snapshot "finished stage=$stage exit=$status"
  pm2_summary
  heading 'kernel memory-kill messages since this run started (if readable)'
  local kernel_log
  if kernel_log=$(journalctl -k --since "$started_at" --no-pager 2>/dev/null); then
    printf '%s\n' "$kernel_log" | grep -Ei 'out of memory|oom|killed process|memory cgroup' | tail -n 40 ||
      printf '[ui-memory] No matching readable kernel messages; sudo may be needed.\n'
  else
    printf '[ui-memory] Kernel journal unavailable; check it manually with sudo.\n'
  fi
  exit "$status"
}
trap finish EXIT

heading 'runtime and install settings'
printf 'SSH shell executable: '; readlink /proc/$$/exe || true
printf 'Requested Node: '; cat .nvmrc
command -v node npm pm2 || true
node --version
npm --version
node <<'JS'
const fs = require("node:fs")
console.log("Node executable:", process.execPath)
console.log("Node heap limit MiB:", Math.round(require("node:v8").getHeapStatistics().heap_size_limit / 1048576))
if (process.availableMemory) console.log("Node available memory MiB:", Math.round(process.availableMemory() / 1048576))
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
console.log("Requested Nuxt:", pkg.dependencies?.nuxt || pkg.devDependencies?.nuxt)
for (const name of ["nuxt", "typescript"]) {
  try { console.log(`Installed ${name}:`, require(`${name}/package.json`).version) }
  catch { console.log(`Installed ${name}: unavailable`) }
}
console.log("Existing package-lock.json:", fs.existsSync("package-lock.json"))
JS
printf 'npm omit: '; npm config get omit
printf 'npm ignore-scripts: '; npm config get ignore-scripts
printf 'npm foreground-scripts: '; npm config get foreground-scripts
ulimit -a
df -h . /tmp
snapshot before-install
pm2_summary

# A separate process keeps recording while npm (and its prepare children) runs.
(
  trap - EXIT
  sleep_pid=
  trap '[[ -z "$sleep_pid" ]] || kill "$sleep_pid" 2>/dev/null; exit 0' TERM INT
  while true; do
    sleep 10 &
    sleep_pid=$!
    wait "$sleep_pid"
    sleep_pid=
    snapshot sample
  done
) &
monitor_pid=$!

timed() {
  if [[ -x /usr/bin/time ]] && /usr/bin/time --version 2>&1 | grep -q GNU; then
    /usr/bin/time -v "$@"
  else
    "$@"
  fi
}

stage=install
heading 'npm install (lifecycle output enabled to identify the failing phase)'
timed npm install --include=dev --foreground-scripts
snapshot after-install

stage=build
heading 'Nuxt build'
timed npm run build
stage=complete

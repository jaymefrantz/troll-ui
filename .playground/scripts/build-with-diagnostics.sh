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
    for directory in "/sys/fs/cgroup/memory${relative}" /sys/fs/cgroup/memory; do
      for file in memory.usage_in_bytes memory.max_usage_in_bytes memory.limit_in_bytes memory.failcnt memory.oom_control; do
        if [[ -r "$directory/$file" ]]; then
          printf '[ui-memory] %s: ' "$directory/$file"
          tr '\n' ' ' < "$directory/$file"
          printf '\n'
        fi
      done
    done
  fi
}

snapshot() {
  heading "$*"
  free -m || true
  # RSS is KiB; comm avoids exposing secrets in process arguments.
  ps -eo pid,ppid,rss,%mem,comm --sort=-rss | head -n 16 || true
  cgroup_memory || true
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
command -v node npm
node --version
npm --version
node -e 'console.log("Node heap limit MiB:", Math.round(require("node:v8").getHeapStatistics().heap_size_limit / 1024 / 1024))'
printf 'npm omit: '; npm config get omit
printf 'npm ignore-scripts: '; npm config get ignore-scripts
printf 'npm foreground-scripts: '; npm config get foreground-scripts
ulimit -a
df -h . /tmp
snapshot before-install

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
timed npm install --include=dev --foreground-scripts --timing
snapshot after-install

stage=build
heading 'Nuxt build'
timed npm run build
stage=complete

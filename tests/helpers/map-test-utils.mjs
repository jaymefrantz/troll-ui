import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { compileScript, parse } from "@vue/compiler-sfc"
import ts from "typescript"

const require = createRequire(import.meta.url)
export const { createRenderer, defineComponent, h, markRaw, nextTick, onMounted, onUnmounted, reactive, ref } = require("vue")
const components = new Map()

export function loadVue(filename, modules = {}, cache = components) {
  const path = filename.pathname
  if (cache.has(path)) return cache.get(path)
  const { descriptor } = parse(readFileSync(filename, "utf8"), { filename: path })
  const script = compileScript(descriptor, {
    id: path,
    inlineTemplate: true,
    fs: { fileExists: existsSync, readFile: file => readFileSync(file, "utf8") },
    templateOptions: { preprocessLang: descriptor.template?.lang, preprocessOptions: { doctype: "html" } },
  })
  const compiled = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const componentModule = { exports: {} }
  const componentRequire = specifier => {
    if (specifier in modules) return modules[specifier]
    if (specifier.endsWith(".css")) return {}
    if (specifier.endsWith(".vue")) return { default: loadVue(new URL(specifier, filename), modules, cache) }
    return require(specifier)
  }
  new Function("require", "module", "exports", compiled)(componentRequire, componentModule, componentModule.exports)
  cache.set(path, componentModule.exports.default)
  return componentModule.exports.default
}

// A Vue host with a small in-memory DOM lets us test Teleport and component lifetimes
// without a Maps API key or a browser. Google projection/redraw is simulated below.
export function element(type = "div") {
  return {
    type,
    style: {},
    children: [],
    parent: null,
    props: {},
    appendChild(child) {
      child.remove()
      child.parent = this
      this.children.push(child)
    },
    remove() {
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1)
      this.parent = null
    },
  }
}

export const renderer = createRenderer({
  createElement: element,
  createText: text => Object.assign(element("text"), { text }),
  createComment: text => Object.assign(element("comment"), { text }),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => { node.text = text },
  parentNode: node => node.parent,
  nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  patchProp: (node, key, _previous, value) => { node.props[key] = value },
  remove: node => node.remove(),
  insert(node, parent, anchor) {
    node.remove()
    node.parent = parent
    const index = anchor ? parent.children.indexOf(anchor) : -1
    if (index < 0) parent.children.push(node)
    else parent.children.splice(index, 0, node)
  },
})

export function mapsApi() {
  const instances = []
  class OverlayView {
    static preventMapHitsAndGesturesFrom(node) { node.blocksMapGestures = true }
    constructor() { instances.push(this) }
    setMap(map) {
      if (map === this.map) return
      if (this.map) {
        this.map.overlays.delete(this)
        this.onRemove()
      }
      this.map = map
      if (map) {
        map.overlays.add(this)
        this.onAdd()
        this.draw()
      }
    }
    getPanes() { return { floatPane: this.map.pane } }
    getProjection() {
      return { fromLatLngToDivPixel: position => ({
        x: position.lng * this.map.scale + this.map.panX,
        y: position.lat * this.map.scale + this.map.panY,
      }) }
    }
  }
  return {
    instances,
    api: markRaw({ OverlayView, LatLng: class { constructor(position) { Object.assign(this, position) } } }),
  }
}

export function createMap(scale = 10) {
  const listeners = new Map()
  return markRaw({
    pane: element(), scale, panX: 0, panY: 0,
    zoom: 13,
    getZoom() { return this.zoom },
    addListener(event, callback) {
      const callbacks = listeners.get(event) ?? new Set()
      callbacks.add(callback)
      listeners.set(event, callbacks)
      return { remove: () => callbacks.delete(callback) }
    },
    emit(event) { listeners.get(event)?.forEach(callback => callback()) },
    listenerCount() { return [...listeners.values()].reduce((total, callbacks) => total + callbacks.size, 0) },
    overlays: new Set(),
    // Simulate Google's own OverlayView lifecycle, without custom camera listeners.
    redraw() { this.overlays.forEach(overlay => overlay.draw()) },
  })
}


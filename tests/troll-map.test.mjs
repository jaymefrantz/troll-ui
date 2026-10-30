import assert from "node:assert/strict"
import test from "node:test"
import { loadVue, element, renderer, defineComponent, h, nextTick, onMounted, onUnmounted, reactive, ref, markRaw } from "./helpers/map-test-utils.mjs"

function fixture({ markers, appConfig = {}, initialZoom = 13, overrideOptions = {}, overlayComponent = null, apiPromise } = {}) {
  const nativeMap = {
    zoom: initialZoom,
    getZoom() { return this.zoom },
    setZoom(value) { this.zoom = value },
    setCenter(value) { this.center = value },
    fitBounds(value) { this.bounds = value.positions },
  }
  const api = {
    Size: class { constructor(width, height) { Object.assign(this, { width, height }) } },
    Point: class { constructor(x, y) { Object.assign(this, { x, y }) } },
    LatLngBounds: class { positions = []; extend(position) { this.positions.push(position) } },
  }
  const markerRecords = []
  let mapEmit
  let mapProps
  let observerStops = 0
  const GoogleMap = defineComponent({
    props: ["apiKey", "apiPromise", "zoom", "minZoom", "maxZoom"],
    setup(_props, { expose, slots, emit }) {
      mapProps = _props
      const ready = ref(false)
      expose({ ready, map: nativeMap, api })
      mapEmit = emit
      onMounted(() => { ready.value = true; emit("idle") })
      return () => h("div", slots.default?.())
    },
  })
  const GoogleMarker = defineComponent({
    props: ["options"],
    setup(props, { expose, emit }) {
      expose({ marker: {} })
      const record = { props, emit }
      onMounted(() => markerRecords.push(record))
      onUnmounted(() => markerRecords.splice(markerRecords.indexOf(record), 1))
      return () => h("button", props.options.title)
    },
  })
  const modules = {
    "vue3-google-map": { GoogleMap, Marker: GoogleMarker },
    "#imports": {
      useAppConfig: () => appConfig,
      useRuntimeConfig: () => ({ public: { GMAPS_KEY: "test" } }),
    },
    "@vueuse/core": {
      useDebounceFn: fn => fn,
      useResizeObserver: () => ({ stop: () => observerStops++ }),
    },
    "../../composables/useTrollBreakpoints": { useTrollBreakpoints: () => ({ smallerOrEqual: () => ref(false) }) },
    "../../utils/gmap": { mapOptions: { minZoom: 1, maxZoom: 16 } },
    "../../utils/gmap/polaroids": { getNextLevel: marker => marker.level === "city" ? "polaroid" : "city" },
  }
  const cache = new Map()
  const TrollMap = loadVue(new URL("../app/components/Troll/Map.vue", import.meta.url), modules, cache)
  const TrollMarker = loadVue(new URL("../app/components/Troll/Marker.vue", import.meta.url), modules, cache)
  const exposed = ref(null)
  const events = []
  const drags = []
  const state = reactive({ markers, overlay: overlayComponent, overlayProps: {}, present: true })
  let readyOverlay
  const app = renderer.createApp({
    render: () => state.present ? h(TrollMap, {
      ref: exposed,
      markers: state.markers,
      initialZoom,
      overrideOptions,
      overlayComponent: state.overlay,
      apiPromise,
      overlayProps: state.overlayProps,
      onReady: () => { readyOverlay = exposed.value?.overlay },
      onMarkerClick: marker => events.push(marker),
      onMarkerDragend: marker => drags.push(marker),
    }) : null,
  })
  app.component("ClientOnly", { setup: (_props, { slots }) => () => slots.default?.() })
  app.component("TrollMarker", TrollMarker)
  const previousGoogle = globalThis.google
  globalThis.google = { maps: api }
  app.mount(element())
  return {
    state, exposed, events, drags, markerRecords, nativeMap, api,
    mapEmit: (...args) => mapEmit(...args),
    observerStops: () => observerStops,
    readyOverlay: () => readyOverlay,
    mapProps: () => mapProps,
    cleanup() {
      app.unmount()
      if (previousGoogle === undefined) delete globalThis.google
      else globalThis.google = previousGoogle
    },
  }
}

test("plain markers work without map config, level, polaroids, or an overlay", async () => {
  const position = { lat: 2, lng: 3 }
  const f = fixture({ markers: [{ id: "one", title: "A shop", position, icon: "normal.svg", hoverIcon: "hover.svg" }] })
  try {
    await nextTick()
    await nextTick()
    assert.equal(f.exposed.value.ready, true)
    assert.equal(f.exposed.value.loaded, true)
    assert.equal(f.exposed.value.overlay, null)
    assert.equal(f.nativeMap.zoom, 13, "a single plain marker should not force the country zoom")
    assert.deepEqual(f.nativeMap.center, position)
    assert.equal(f.markerRecords.length, 1)
    const marker = f.markerRecords[0]
    assert.equal(marker.props.options.label, undefined, "a generic marker has no inferred photo count")
    assert.equal(marker.props.options.icon.url, "normal.svg")
    marker.emit("mouseover")
    await nextTick()
    assert.equal(marker.props.options.icon.url, "hover.svg")
    marker.emit("mouseout")
    await nextTick()
    assert.equal(marker.props.options.icon.url, "normal.svg")
    marker.emit("click")
    assert.equal(f.events[0].id, "one")
    assert.ok(f.events[0].gmapMarker)
    marker.emit("dragend", { latLng: { lat: () => 10, lng: () => 20 } })
    assert.deepEqual(f.drags[0].newPosition, { lat: 10, lng: 20 })
  } finally { f.cleanup() }
  assert.equal(f.observerStops(), 1, "the resize observer is cleaned up on unmount")
})

test("an initially selected overlay is exposed before ready reaches the consuming app", async () => {
  const selected = markRaw(defineComponent({
    setup(_props, { expose }) {
      expose({ identify: () => "selected" })
      return () => null
    },
  }))
  const f = fixture({ overlayComponent: selected })
  try {
    await nextTick()
    await nextTick()
    assert.equal(f.readyOverlay().identify(), "selected")
  } finally { f.cleanup() }
})

test("a consuming app can reuse its already-loaded Google Maps API", async () => {
  const apiPromise = Promise.resolve({ maps: {} })
  const f = fixture({ apiPromise })
  try {
    await nextTick()
    assert.equal(f.mapProps().apiPromise, apiPromise)
  } finally { f.cleanup() }
})

test("explicit labels, legacy counts, custom icon options, and zoom overrides are preserved", async () => {
  const f = fixture({
    markers: [
      { id: "a", position: { lat: 1, lng: 1 }, label: "A", icon: "custom.svg", iconOptions: { anchor: { x: 4, y: 5 } } },
      { id: "b", position: { lat: 2, lng: 2 }, level: "city", polaroids: ["photo"] },
    ],
    overrideOptions: { minZoom: 12, maxZoom: 14 },
  })
  try {
    await nextTick()
    await nextTick()
    assert.equal(f.markerRecords[0].props.options.label.text, "A")
    assert.deepEqual(f.markerRecords[0].props.options.icon.anchor, { x: 4, y: 5 })
    assert.equal(f.markerRecords[1].props.options.label.text, "1")
    assert.equal(f.nativeMap.bounds.length, 2)
    f.exposed.value.zoomControls.zoomIn()
    assert.equal(f.nativeMap.zoom, 14)
    f.mapEmit("zoom_changed")
    f.exposed.value.zoomControls.zoomIn()
    assert.equal(f.nativeMap.zoom, 14)
    f.nativeMap.zoom = 12
    f.mapEmit("zoom_changed")
    f.exposed.value.zoomControls.zoomOut()
    assert.equal(f.nativeMap.zoom, 12)
  } finally { f.cleanup() }
})

test("overlay components are opt-in, receive props/context, and are disposed when disabled or replaced", async () => {
  const f = fixture()
  let mounted = 0
  let unmounted = 0
  const received = []
  function preset(name) {
    return markRaw(defineComponent({
      props: ["map", "api", "message"],
      setup(props, { expose }) {
        onMounted(() => mounted++)
        onUnmounted(() => unmounted++)
        expose({ identify: () => name })
        received.push(props)
        return () => null
      },
    }))
  }
  try {
    await nextTick()
    await nextTick()
    assert.equal(mounted, 0)
    f.state.overlayProps = { message: "custom data", map: "must not override the real map" }
    f.state.overlay = preset("first")
    await nextTick()
    assert.equal(mounted, 1)
    assert.equal(f.exposed.value.overlay.identify(), "first")
    assert.equal(received[0].message, "custom data")
    assert.equal(received[0].map, f.nativeMap)
    assert.equal(received[0].api, f.api)
    f.state.overlay = preset("second")
    await nextTick()
    assert.equal(unmounted, 1)
    assert.equal(f.exposed.value.overlay.identify(), "second")
    f.state.overlay = null
    await nextTick()
    assert.equal(unmounted, 2)
    assert.equal(f.exposed.value.overlay, null)
    f.state.overlay = preset("last")
    await nextTick()
    f.state.present = false
    await nextTick()
    assert.equal(mounted, unmounted)
  } finally { f.cleanup() }
})

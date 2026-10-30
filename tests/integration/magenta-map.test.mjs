import assert from "node:assert/strict"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import test from "node:test"
import { loadVue, element, renderer, defineComponent, h, markRaw, nextTick, onMounted, ref } from "../helpers/map-test-utils.mjs"

const site = process.env.MAGENTA_SITE

test("Magenta selects the preset, shares its Maps API, preserves its public methods, and forwards events once", { skip: !site }, async () => {
  const google = { maps: {} }
  const preset = markRaw({ name: "PolaroidPreset", render: () => null })
  const calls = []
  const controller = { showLabel: marker => calls.push(["label", marker]) }
  const level = ref("country")
  let received
  let emitMap
  const TrollMap = defineComponent({
    props: ["markers", "overlayComponent", "apiPromise", "overrideOptions", "initialLevel", "initialZoom"],
    emits: ["ready", "loaded", "zoomChanged", "markerClick", "markerMouseOver", "markerMouseOut", "markerDragend"],
    setup(props, { slots, expose, emit }) {
      received = props
      emitMap = emit
      expose({
        overlay: controller,
        level,
        fitbounds: () => calls.push(["fit"]),
        setCenter: position => calls.push(["center", position]),
        setZoom: zoom => calls.push(["zoom", zoom]),
        zoomControls: { zoomInHidden: ref(false), zoomOutHidden: ref(false), zoom: ref(13) },
      })
      onMounted(() => emit("ready"))
      return () => h("div", slots.zoomContol?.())
    },
  })
  const modules = {
    "#components": { TrollMap, TrollPolaroidOverlay: preset },
    "#imports": {
      useAppConfig: () => ({ animatedIcons: { add: {}, minus: {} }, colors: { purple: ["", "#purple"] } }),
      useNuxtApp: () => ({ $google: google }),
    },
  }
  for (const name of ["city", "city-marker-hover", "polaroid", "polaroid-marker-hover"]) {
    const filename = name.endsWith("-hover") ? `gmap-${name}` : `gmap-${name}-marker`
    modules[`./assets/svg/markers/${filename}.svg?data`] = { default: `${name}.svg` }
  }
  const MagentaMap = loadVue(pathToFileURL(join(site, "app/components/Map.vue")), modules, new Map())
  const wrapper = ref(null)
  let clicks = 0
  const drags = []
  let ready = 0
  const marker = { id: "city", level: "city", position: { lat: 1, lng: 2 }, polaroids: ["one", "two"], options: { draggable: true } }
  const app = renderer.createApp({ render: () => h(MagentaMap, {
    ref: wrapper,
    markers: [marker],
    onMarkerClick: () => clicks++,
    onMarkerDragend: marker => drags.push(marker),
    onReady: () => ready++,
  }) })
  app.component("AnimatedIconLink", { render: () => h("button") })
  try {
    app.mount(element())
    await nextTick()
    assert.equal(received.overlayComponent, preset)
    assert.equal(await received.apiPromise, google)
    assert.equal(received.markers[0].icon, "city.svg")
    assert.equal(received.markers[0].hoverIcon, "city-marker-hover.svg")
    assert.equal(received.markers[0].color, "#purple")
    assert.equal(received.markers[0].options.draggable, true)
    assert.equal(ready, 1)
    emitMap("markerClick", marker)
    assert.equal(clicks, 1, "the listener must not also fall through to the child")
    emitMap("markerDragend", { ...marker, newPosition: { lat: 3, lng: 4 } })
    assert.equal(drags.length, 1)
    assert.deepEqual(drags[0].newPosition, { lat: 3, lng: 4 })
    wrapper.value.overlay.showLabel(marker)
    wrapper.value.fitbounds()
    wrapper.value.setCenter(marker.position)
    wrapper.value.setZoom(14)
    wrapper.value.level = "city"
    assert.equal(level.value, "city")
    assert.equal(wrapper.value.zoom, 13)
    assert.deepEqual(calls, [["label", marker], ["fit"], ["center", marker.position], ["zoom", 14]])
  } finally { app.unmount() }
})

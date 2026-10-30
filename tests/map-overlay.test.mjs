import assert from "node:assert/strict"
import test from "node:test"
import { renderToString } from "@vue/server-renderer"
import { loadVue, element, renderer, mapsApi, createMap, defineComponent, h, nextTick, onMounted, onUnmounted, reactive } from "./helpers/map-test-utils.mjs"

const MapOverlay = loadVue(new URL("../app/components/Troll/MapOverlay.vue", import.meta.url))

test("Vue content is mounted on demand, reacts, follows redraws, and is cleaned up", async () => {
  const previousDocument = globalThis.document
  globalThis.document = { createElement: element }
  const { instances, api } = mapsApi()
  const map = createMap()
  const state = reactive({ open: false, position: { lat: 2, lng: 3 }, count: 0, zIndex: 1, map, present: true })
  let mounted = 0
  let unmounted = 0
  const Probe = defineComponent({
    setup() {
      onMounted(() => mounted++)
      onUnmounted(() => unmounted++)
      return () => h("button", { onClick: () => state.count++ }, String(state.count))
    },
  })
  const app = renderer.createApp({
    render: () => state.present ? h(MapOverlay, {
      open: state.open, position: state.position, map: state.map, api, zIndex: state.zIndex,
    }, { default: () => h(Probe) }) : null,
  })

  try {
    app.mount(element())
    await nextTick()
    assert.equal(instances.length, 0, "closed overlays should allocate nothing")
    assert.equal(mounted, 0, "closed slot content must never mount")

    state.open = true
    await nextTick()
    assert.equal(instances.length, 1)
    assert.equal(map.listenerCount(), 0, "positioning must rely on Google's draw lifecycle")
    assert.equal(mounted, 1)
    const host = map.pane.children[0]
    assert.equal(host.style.left, "30px")
    assert.equal(host.style.top, "20px")
    assert.equal(host.style.transform, "translate(0px, 0px) translate(-50%, -100%)",
      "the Maps element itself must move, so its hit area follows the visible content")
    assert.equal(host.blocksMapGestures, true)
    const content = host.children.find(node => node.type === "div")
    assert.equal(content.props.style, undefined, "the child must not leave its host's hit area behind")
    const button = content.children.find(node => node.type === "button")
    button.props.onClick()
    await nextTick()
    assert.equal(button.text, "1", "teleported Vue events and reactive updates work")

    map.panX = 7
    map.scale = 20
    map.redraw()
    assert.equal(host.style.left, "67px", "Google's draw callback updates the geographic anchor")
    map.panY = 15
    map.redraw()
    assert.equal(host.style.top, "55px", "a redraw follows a vertical pan")
    map.panY = 0
    map.redraw()
    assert.equal(host.style.top, "40px", "the anchor is correct when movement settles")
    state.position.lat = 5
    await nextTick()
    assert.equal(host.style.top, "100px", "changing coordinates redraws without remounting")
    assert.equal(instances.length, 1)
    state.zIndex = 9
    await nextTick()
    assert.equal(host.style.zIndex, "9")

    state.open = false
    await nextTick()
    assert.equal(map.pane.children.length, 0)
    assert.equal(unmounted, 1)
    assert.equal(instances[0].map, null)
    assert.equal(map.overlays.size, 0)

    state.open = true
    await nextTick()
    assert.equal(mounted, 2)
    const otherMap = createMap(1)
    state.map = otherMap
    await nextTick()
    assert.equal(map.pane.children.length, 0, "changing maps detaches the old overlay")
    assert.equal(map.overlays.size, 0)
    assert.equal(otherMap.pane.children.length, 1)

    state.present = false
    await nextTick()
    assert.equal(otherMap.pane.children.length, 0, "unmounting removes the map attachment")
    assert.equal(mounted, unmounted, "all slot content is unmounted")
    assert.ok(instances.every(instance => instance.map === null))
    assert.equal(otherMap.overlays.size, 0)
  } finally {
    app.unmount()
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
})

test("server rendering does not need Google Maps or document, even when open", async () => {
  for (const open of [false, true]) {
    let renderedSlot = false
    await renderToString(h(MapOverlay, { open, position: { lat: 0, lng: 0 } }, {
      default: () => { renderedSlot = true; return h("span", "content") },
    }))
    assert.equal(renderedSlot, false)
  }
})

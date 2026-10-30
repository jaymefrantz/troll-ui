import assert from "node:assert/strict"
import test from "node:test"
import { loadVue, element, renderer, mapsApi, createMap, h, nextTick, ref } from "./helpers/map-test-utils.mjs"

const PolaroidOverlay = loadVue(new URL("../app/components/Troll/PolaroidOverlay.vue", import.meta.url))
const first = { id: "one", image: "first.jpg", position: { lat: 2, lng: 3 } }
const second = { id: "two", image: "second.jpg", position: { lat: 2, lng: 4 } }

function fixture() {
  const { api, instances } = mapsApi()
  const map = createMap()
  const controller = ref(null)
  const app = renderer.createApp({ render: () => h(PolaroidOverlay, { map, api, ref: controller }) })
  app.mount(element())
  return { app, map, controller, instances }
}

function find(node, type) {
  if (node.type === type) return node
  for (const child of node.children) {
    const found = find(child, type)
    if (found) return found
  }
}

test("polaroid API supports hover, pin, close, zoom filtering, and complete cleanup", async t => {
  const previousDocument = globalThis.document
  globalThis.document = { createElement: element }
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const { app, map, controller, instances } = fixture()
  const overlay = controller.value
  try {
    await nextTick()
    assert.equal(instances.length, 0, "a preset with no content creates no native overlays")
    assert.equal(map.listenerCount(), 1, "only the preset's zoom visibility rule needs a listener")

    overlay.showLabel({ title: "<b>Plain text</b>", position: first.position })
    await nextTick()
    assert.equal(map.pane.children.length, 1)
    assert.equal(find(map.pane.children[0], "span").text, "<b>Plain text</b>")
    overlay.hideLabel({ title: "<b>Plain text</b>" })
    overlay.showLabel({ title: "Next label", position: second.position })
    t.mock.timers.tick(25)
    await nextTick()
    assert.equal(find(map.pane.children[0], "span").text, "Next label", "an old hide must not remove a new label")
    overlay.hideLabel({ title: "Next label" })
    t.mock.timers.tick(25)
    await nextTick()
    assert.equal(map.pane.children.length, 0)

    overlay.addPolaroid(first)
    await nextTick()
    assert.equal(map.pane.children.length, 1)
    const dismissed = overlay.removePreview(first.id)
    t.mock.timers.tick(250)
    await nextTick()
    assert.equal(overlay.previews.one.closing, true)
    t.mock.timers.tick(150)
    await dismissed
    await nextTick()
    assert.equal(map.pane.children.length, 0, "dismissed previews are removed rather than retained hidden")
    assert.deepEqual(Object.keys(overlay.previews), [])

    overlay.addPolaroid(first)
    overlay.polaroidClicked(first.id)
    overlay.addPolaroid(second, true)
    await nextTick()
    const mouseOut = overlay.removePreview(first.id)
    t.mock.timers.tick(250)
    await mouseOut
    await nextTick()
    assert.equal(map.pane.children.length, 2, "pinned previews survive mouseout")

    const pending = overlay.removePreview(first.id, true)
    overlay.showPreview(first.id)
    await pending
    t.mock.timers.tick(500)
    await nextTick()
    assert.equal(map.pane.children.length, 2, "reopening cancels stale removal work")

    const closeButton = find(map.pane.children[0], "button")
    closeButton.props.onClick()
    t.mock.timers.tick(250)
    t.mock.timers.tick(150)
    await nextTick()
    assert.equal(map.pane.children.length, 1, "the close button dismisses a pinned preview")

    map.zoom = 8
    map.emit("zoom_changed")
    await nextTick()
    assert.equal(map.pane.children.length, 0)
    overlay.addPolaroid(first)
    await nextTick()
    assert.equal(map.pane.children.length, 0, "previews cannot open below the minimum zoom")
    map.zoom = 13
    map.emit("zoom_changed")
    await nextTick()
    assert.equal(map.pane.children.length, 0, "zooming back in does not restore dismissed previews")

    overlay.addPolaroid(first, true)
    overlay.addPolaroid(second, true)
    overlay.removeAllPreviews()
    await nextTick()
    assert.equal(map.pane.children.length, 0)
    overlay.addPolaroid(first)
    await nextTick()
    const unmountPending = overlay.removePreview(first.id)
    app.unmount()
    await unmountPending
    t.mock.timers.tick(1000)
    await nextTick()
    assert.equal(map.pane.children.length, 0)
    assert.equal(map.listenerCount(), 0)
    assert.ok(instances.every(instance => instance.map === null))
  } finally {
    app.unmount()
    t.mock.timers.reset()
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
})

test("two preset instances isolate labels and matching preview IDs", async () => {
  const previousDocument = globalThis.document
  globalThis.document = { createElement: element }
  const left = fixture()
  const right = fixture()
  try {
    left.controller.value.showLabel({ title: "Left", position: first.position })
    right.controller.value.showLabel({ title: "Right", position: first.position })
    left.controller.value.addPolaroid(first, true)
    right.controller.value.addPolaroid(first, true)
    await nextTick()
    assert.equal(left.map.pane.children.length, 2)
    assert.equal(right.map.pane.children.length, 2)
    left.controller.value.removeAllPreviews()
    await nextTick()
    assert.equal(left.map.pane.children.length, 1)
    assert.equal(right.map.pane.children.length, 2)
    assert.equal(find(right.map.pane.children[0], "span").text, "Right")
    left.app.unmount()
    assert.equal(right.map.pane.children.length, 2)
  } finally {
    left.app.unmount()
    right.app.unmount()
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
})

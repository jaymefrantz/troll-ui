<template>
  <section class="map-options-demo">
    <p>
      These markers have no level or polaroids fields. Choose no overlay, the shared polaroid preset,
      or a custom Vue component. The app decides what marker clicks and hovers do.
    </p>
    <div class="demo-controls">
      <button type="button" :aria-pressed="mode === 'none'" @click="mode = 'none'">Use no overlay</button>
      <button type="button" :aria-pressed="mode === 'polaroid'" @click="mode = 'polaroid'">Use polaroid overlay</button>
      <button type="button" :aria-pressed="mode === 'custom'" @click="mode = 'custom'">Use custom overlay</button>
      <button type="button" @click="toggleSingle">{{ single ? 'Show both markers' : 'Show one marker' }}</button>
      <button type="button" @click="map?.gmap?.map?.panBy(60, 20)">Pan map</button>
    </div>
    <p role="status">
      Overlay selected: {{ mode }} · Overlay instance: {{ map?.overlay ? 'yes' : 'no' }} ·
      Last marker event: {{ lastEvent }} · Visits: {{ visits }}
    </p>
    <TrollMap
      ref="map"
      :markers="markers"
      :initial-zoom="13"
      :overlay-component="selectedOverlay"
      :overlay-props="overlaySettings"
      :override-options="{ maxZoom: 17 }"
      @markerClick="markerClick"
      @markerMouseOver="markerMouseOver"
      @markerMouseOut="markerMouseOut"
    />
  </section>
</template>

<script setup lang="ts">
  import TrollMap from "../../../../app/components/Troll/Map.vue"
  import PolaroidOverlay from "../../../../app/components/Troll/PolaroidOverlay.vue"
  import DemoMapOverlay from "../components/DemoMapOverlay.vue"
  import icon from "../assets/svg/map-marker.svg?url"
  import image from "../assets/svg/troll-ui-logo.svg?url"
  import type { MapMarker, MapMarkerEvent } from "../../../../app/types/gmap"

  const map = ref<InstanceType<typeof TrollMap> | null>(null)
  const mode = ref<"none" | "polaroid" | "custom">("none")
  const single = ref(false)
  const lastEvent = ref("none")
  const visits = ref(0)
  const places: MapMarker[] = [
    { id: "coffee", title: "Coffee shop", position: { lat: 41.49, lng: -71.32 }, icon, label: "A" },
    { id: "books", title: "Book shop", position: { lat: 41.49, lng: -71.29 }, icon },
  ]
  const markers = computed(() => single.value ? places.slice(0, 1) : places)
  const selectedOverlay = computed(() => mode.value === "polaroid" ? PolaroidOverlay : mode.value === "custom" ? DemoMapOverlay : null)
  const overlaySettings = computed(() => mode.value === "custom" ? {
    heading: "Custom shop card",
    onVisit: () => visits.value++,
  } : { polaroidMaxZoom: 9 })
  const custom = () => map.value?.overlay as InstanceType<typeof DemoMapOverlay> | null
  const polaroid = () => map.value?.overlay as InstanceType<typeof PolaroidOverlay> | null
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  function markerClick(marker: MapMarkerEvent) {
    clearTimeout(hoverTimer)
    lastEvent.value = `click ${marker.id}`
    if (mode.value === "custom") custom()?.show(marker, true)
    if (mode.value === "polaroid") polaroid()?.addPolaroid({ id: marker.id, image, position: marker.position }, true)
  }

  function markerMouseOver(marker: MapMarkerEvent) {
    clearTimeout(hoverTimer)
    lastEvent.value = `hover ${marker.id}`
    if (mode.value === "custom") custom()?.show(marker)
    if (mode.value === "polaroid") hoverTimer = setTimeout(() => {
      polaroid()?.addPolaroid({ id: marker.id, image, position: marker.position })
    }, 250)
  }

  function markerMouseOut(marker: MapMarkerEvent) {
    clearTimeout(hoverTimer)
    if (mode.value === "custom") custom()?.hide()
    if (mode.value === "polaroid") polaroid()?.removePreview(marker.id)
  }

  async function toggleSingle() {
    single.value = !single.value
    await nextTick()
    map.value?.fitbounds()
  }

  watch(mode, () => clearTimeout(hoverTimer))
  onBeforeUnmount(() => clearTimeout(hoverTimer))
</script>

<style scoped>
  .map-options-demo > p,
  .demo-controls { margin-bottom: 1rem; }
  .demo-controls { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  button { padding: 0.5rem 0.75rem; cursor: pointer; }
  button[aria-pressed="true"] { font-weight: bold; }
</style>

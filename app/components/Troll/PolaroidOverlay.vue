<template>
  <MapOverlay :map="map" :api="api" :open="label !== null" :position="label?.position ?? origin" anchor="top-left">
    <span class="marker-location-label shown">{{ label?.title }}</span>
  </MapOverlay>

  <MapOverlay
    v-for="preview in previews"
    :key="preview.id"
    :map="map"
    :api="api"
    :open="true"
    :position="preview.position"
    anchor="top-left"
  >
    <div class="marker-preview-container" :class="{ shown: !preview.closing, leave: preview.closing }">
      <div class="marker-preview">
        <button
          type="button"
          class="close-preview-button"
          aria-label="Close preview"
          @click="closePreview(preview.id)"
        />
        <div class="marker-preview-image-wrap">
          <img :src="preview.image" alt="Polaroid preview" width="128" height="102" />
        </div>
      </div>
    </div>
  </MapOverlay>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, ref, watch } from "vue"
  import MapOverlay from "./MapOverlay.vue"
  import type { MapMarker, PolaroidOverlayItem, PolaroidPreviewState, PolaroidOverlayController } from "../../types/gmap"
  import "../../assets/ui/scss/map-overlays.css"

  const props = withDefaults(
    defineProps<{
      map?: google.maps.Map | null
      api?: typeof google.maps | null
      polaroidMaxZoom?: number
    }>(),
    { polaroidMaxZoom: 9 }
  )

  const origin = { lat: 0, lng: 0 }
  const label = ref<Pick<MapMarker, "title" | "position"> | null>(null)
  const previews = ref<Record<string, PolaroidPreviewState>>({})
  let labelTimer: ReturnType<typeof setTimeout> | undefined
  const removals = new Map<string, {
    timer: ReturnType<typeof setTimeout>
    resolve: () => void
  }>()

  function cancelRemoval(id: string) {
    const removal = removals.get(id)
    if (!removal) return
    clearTimeout(removal.timer)
    removals.delete(id)
    removal.resolve()
  }

  function canShowPreviews() {
    return (props.map?.getZoom() ?? props.polaroidMaxZoom) >= props.polaroidMaxZoom
  }

  function showLabel(marker: Pick<MapMarker, "title" | "position">) {
    clearTimeout(labelTimer)
    label.value = marker.title ? { title: marker.title, position: { ...marker.position } } : null
  }

  function hideLabel(marker: Pick<MapMarker, "title">) {
    clearTimeout(labelTimer)
    const current = label.value
    labelTimer = setTimeout(() => {
      if (label.value === current && current?.title === marker.title) label.value = null
    }, 25)
  }

  function addPolaroid(item: PolaroidOverlayItem, clicked = false) {
    if (!canShowPreviews()) return
    cancelRemoval(item.id)
    previews.value[item.id] = {
      ...item,
      position: { ...item.position },
      clicked: previews.value[item.id]?.clicked || clicked || item.clicked === true,
      closing: false,
    }
  }

  function showPreview(id: string) {
    if (!canShowPreviews() || !previews.value[id]) return
    cancelRemoval(id)
    previews.value[id].closing = false
  }

  function polaroidClicked(id: string) {
    const preview = previews.value[id]
    if (!preview) return
    cancelRemoval(id)
    preview.clicked = true
    preview.closing = false
  }

  function removePreview(id: string, hardRemove = false): Promise<void> {
    cancelRemoval(id)
    if (!previews.value[id]) return Promise.resolve()

    return new Promise(resolve => {
      const removal = {
        resolve,
        timer: setTimeout(() => {
          const preview = previews.value[id]
          if (!preview || (preview.clicked && !hardRemove)) {
            removals.delete(id)
            resolve()
            return
          }
          preview.closing = true
          removal.timer = setTimeout(() => {
            delete previews.value[id]
            removals.delete(id)
            resolve()
          }, 150)
        }, 250),
      }
      removals.set(id, removal)
    })
  }

  function closePreview(id: string) {
    if (previews.value[id]) previews.value[id].clicked = false
    return removePreview(id, true)
  }

  function removeAllPreviews() {
    for (const id of removals.keys()) cancelRemoval(id)
    previews.value = {}
  }

  // This single listener enforces preview visibility below the polaroid zoom level.
  // Google OverlayView.draw() handles all geographic positioning without extra listeners.
  function checkZoom() {
    if (!canShowPreviews()) removeAllPreviews()
  }

  watch(
    () => props.map,
    (map, previous, onCleanup) => {
      if (previous) {
        removeAllPreviews()
        clearTimeout(labelTimer)
        label.value = null
      }
      if (!map) return
      checkZoom()
      const listener = map.addListener("zoom_changed", checkZoom)
      onCleanup(() => listener.remove())
    },
    { immediate: true }
  )
  watch(() => props.polaroidMaxZoom, checkZoom)

  onBeforeUnmount(() => {
    clearTimeout(labelTimer)
    removeAllPreviews()
  })

  defineExpose<PolaroidOverlayController>({
    showLabel,
    hideLabel,
    addPolaroid,
    polaroidClicked,
    showPreview,
    removePreview,
    removeAllPreviews,
    previews,
  })
</script>

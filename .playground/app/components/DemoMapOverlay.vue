<template>
  <TrollMapOverlay :map="map" :api="api" :open="selected !== null" :position="selected?.position ?? origin" :offset-y="-48">
    <article class="custom-map-card">
      <h2>{{ heading }}</h2>
      <p>{{ selected?.title }}</p>
      <button type="button" @click="emit('visit', selected!.id)">Visit this place</button>
      <button type="button" @click="close">Close custom card</button>
    </article>
  </TrollMapOverlay>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import type { MapMarker } from "#troll-ui/types/gmap"

  withDefaults(defineProps<{
    map?: google.maps.Map | null
    api?: typeof google.maps | null
    heading?: string
  }>(), { heading: "Place details" })
  const emit = defineEmits<{ (event: "visit", id: string): void }>()
  const origin = { lat: 0, lng: 0 }
  const selected = ref<MapMarker | null>(null)
  const pinned = ref(false)

  function show(marker: MapMarker, pin = false) {
    if (pinned.value && !pin) return
    selected.value = marker
    pinned.value = pin
  }

  function hide() {
    if (!pinned.value) close()
  }

  function close() {
    selected.value = null
    pinned.value = false
  }

  defineExpose({ show, hide })
</script>

<style scoped>
  .custom-map-card {
    width: 14rem;
    padding: 1rem;
    border: 2px solid #236b67;
    border-radius: 0.5rem;
    background: white;
    color: #222;
    font: 14px/1.5 sans-serif;
  }

  h2 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  p { margin-bottom: 0.75rem; }
  button { padding: 0.35rem; cursor: pointer; }
</style>

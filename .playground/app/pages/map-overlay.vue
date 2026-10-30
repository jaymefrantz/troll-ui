<template>
  <section class="overlay-demo">
    <p>
      Hover a marker for a preview, or click one to keep it open. Pan and zoom: the card should stay
      attached to its marker. Only an open card is mounted.
    </p>

    <div class="demo-controls">
      <button type="button" @click="showMarker(locations[0], true)">Open first marker</button>
      <button type="button" @click="close">Close overlay</button>
      <button type="button" @click="gmap?.map?.panBy(60, 20)">Pan map</button>
      <button type="button" @click="zoomIn">Zoom in</button>
      <button type="button" @click="narrow = !narrow">Resize map</button>
      <button type="button" @click="moveMarker">Move first marker</button>
      <button type="button" @click="mapMounted = !mapMounted">
        {{ mapMounted ? "Unmount map" : "Mount map" }}
      </button>
    </div>

    <p role="status">
      Overlay content mounted: {{ contentMounted ? "yes" : "no" }} · Pinned: {{ pinned ? "yes" : "no" }}
      · Button clicks: {{ clicks }}
    </p>
    <p v-if="!apiKey">Set GMAPS_KEY in your local environment to load this map.</p>

    <ClientOnly>
      <GoogleMap
        v-if="mapMounted && apiKey"
        ref="gmap"
        class="demo-map"
        :class="{ narrow }"
        :api-key="apiKey"
        :center="center"
        :zoom="13"
        :styles="mapConfig?.styles"
        :map-type-control="false"
        :street-view-control="false"
      >
        <GoogleMarker
          v-for="location in locations"
          :key="location.id"
          :options="{ position: location.position, title: location.title }"
          @mouseover="showMarker(location)"
          @mouseout="hideHover"
          @click="showMarker(location, true)"
        />
        <TrollMapOverlay
          :map="gmap?.map"
          :api="gmap?.api"
          :open="selected !== null"
          :position="selected?.position ?? center"
          :offset-y="-42"
        >
          <article
            class="demo-card"
            @vue:mounted="contentMounted = true"
            @vue:unmounted="contentMounted = false"
          >
            <h2>{{ selected?.title }}</h2>
            <p>This is Vue content inside an OverlayView. No polaroid data required.</p>
            <button type="button" @click="clicks++">Clicked {{ clicks }} times</button>
            <button type="button" @click="close">Close</button>
          </article>
        </TrollMapOverlay>
      </GoogleMap>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
  import { GoogleMap, Marker as GoogleMarker } from "vue3-google-map"
  import type { MapMarker } from "../../../../app/types/gmap"

  const apiKey = useRuntimeConfig().public.GMAPS_KEY
  const mapConfig = useAppConfig().map
  const gmap = shallowRef<InstanceType<typeof GoogleMap> | null>(null)
  const center = { lat: 41.49, lng: -71.31 }
  const locations = ref<MapMarker[]>([
    { id: "one", title: "First marker", position: { lat: 41.49, lng: -71.32 } },
    { id: "two", title: "Second marker", position: { lat: 41.49, lng: -71.3 } },
  ])
  const selected = ref<MapMarker | null>(null)
  const pinned = ref(false)
  const contentMounted = ref(false)
  const clicks = ref(0)
  const narrow = ref(false)
  const mapMounted = ref(true)

  function showMarker(marker: MapMarker, pin = false) {
    if (pinned.value && !pin) return
    selected.value = marker
    pinned.value = pin
  }

  function close() {
    selected.value = null
    pinned.value = false
  }

  function hideHover() {
    if (!pinned.value) close()
  }

  function moveMarker() {
    const marker = locations.value[0]
    // A new position object lets vue3-google-map detect the marker options change.
    marker.position = { ...marker.position, lat: marker.position.lat === 41.49 ? 41.5 : 41.49 }
  }

  function zoomIn() {
    const map = gmap.value?.map
    if (map) map.setZoom((map.getZoom() ?? 13) + 1)
  }
</script>

<style scoped>
  .overlay-demo > p {
    margin-bottom: 1rem;
  }

  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }

  .demo-map {
    width: 100%;
    height: 30rem;
  }

  .demo-map.narrow {
    width: 65%;
  }

  .demo-card {
    width: 15rem;
    padding: 1rem;
    border: 1px solid #6d6f73;
    border-radius: 0.5rem;
    background: white;
    color: #222;
    box-shadow: 0 0.25rem 1rem #0003;
    font: 14px/1.5 sans-serif;
  }

  .demo-card h2 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .demo-card p {
    margin-bottom: 0.75rem;
  }
</style>

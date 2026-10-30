<template>
  <section class="polaroid-demo">
    <p>
      Hover a photo marker for a delayed preview; click it to pin it. Multiple photos can stay open.
      Hover the location marker for its label. This page uses the new Vue preset, independently of TrollMap.
    </p>
    <div class="demo-controls">
      <button type="button" @click="overlay?.showLabel(location)">Show location label</button>
      <button type="button" @click="overlay?.hideLabel(location)">Hide location label</button>
      <button type="button" @click="overlay?.addPolaroid(photos[0])">Preview first photo</button>
      <button type="button" @click="overlay?.removePreview(photos[0].id)">Mouse out first photo</button>
      <button type="button" @click="pin(photos[0])">Pin first photo</button>
      <button type="button" @click="pin(photos[1])">Pin second photo</button>
      <button type="button" @click="clear">Clear previews</button>
      <button type="button" @click="gmap?.map?.panBy(60, 20)">Pan map</button>
      <button type="button" @click="toggleZoom">{{ zoom >= 9 ? 'Zoom below previews' : 'Restore preview zoom' }}</button>
      <button type="button" @click="mapMounted = !mapMounted">{{ mapMounted ? 'Unmount map' : 'Mount map' }}</button>
    </div>
    <p role="status">Active previews: {{ previewCount }} · Zoom: {{ zoom }}</p>
    <p v-if="!apiKey">Set GMAPS_KEY in your local environment to load this map.</p>
    <ClientOnly>
      <GoogleMap
        v-if="mapMounted && apiKey"
        ref="gmap"
        class="demo-map"
        :api-key="apiKey"
        :center="center"
        :zoom="13"
        :styles="mapConfig?.styles"
        :map-type-control="false"
        :street-view-control="false"
        @zoom_changed="zoom = gmap?.map?.getZoom() ?? 13"
      >
        <GoogleMarker
          :options="{ position: location.position, title: location.title }"
          @mouseover="overlay?.showLabel(location)"
          @mouseout="overlay?.hideLabel(location)"
        />
        <GoogleMarker
          v-for="photo in photos"
          :key="photo.id"
          :options="{ position: photo.position, title: photo.title }"
          @mouseover="hover(photo)"
          @mouseout="mouseOut(photo.id)"
          @click="pin(photo)"
        />
        <PolaroidOverlay ref="overlay" :map="gmap?.map" :api="gmap?.api" />
      </GoogleMap>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
  import { GoogleMap, Marker as GoogleMarker } from "vue3-google-map"
  import PolaroidOverlay from "../../../../app/components/Troll/PolaroidOverlay.vue"
  import previewImage from "../assets/svg/troll-ui-logo.svg?url"
  import type { PolaroidOverlayItem } from "../../../../app/types/gmap"

  const apiKey = useRuntimeConfig().public.GMAPS_KEY
  const mapConfig = useAppConfig().map
  const gmap = shallowRef<InstanceType<typeof GoogleMap> | null>(null)
  const overlay = ref<InstanceType<typeof PolaroidOverlay> | null>(null)
  const center = { lat: 41.49, lng: -71.305 }
  const location = { title: "A location label", position: { lat: 41.49, lng: -71.335 } }
  const photos = [
    { id: "first", title: "First photo", image: previewImage, position: { lat: 41.49, lng: -71.31 } },
    { id: "second", title: "Second photo", image: previewImage, position: { lat: 41.49, lng: -71.28 } },
  ]
  const zoom = ref(13)
  const mapMounted = ref(true)
  const previewCount = computed(() => Object.keys(overlay.value?.previews ?? {}).length)
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  function hover(photo: PolaroidOverlayItem) {
    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => overlay.value?.addPolaroid(photo), 250)
  }

  function mouseOut(id: string) {
    clearTimeout(hoverTimer)
    overlay.value?.removePreview(id)
  }

  function pin(photo: PolaroidOverlayItem) {
    clearTimeout(hoverTimer)
    overlay.value?.addPolaroid(photo, true)
  }

  function clear() {
    clearTimeout(hoverTimer)
    overlay.value?.removeAllPreviews()
  }

  function toggleZoom() {
    clearTimeout(hoverTimer)
    gmap.value?.map?.setZoom(zoom.value >= 9 ? 8 : 13)
  }

  watch(mapMounted, clear)
  onBeforeUnmount(() => clearTimeout(hoverTimer))
</script>

<style scoped>
  .polaroid-demo > p,
  .demo-controls {
    margin-bottom: 1rem;
  }

  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }

  .demo-map {
    width: 100%;
    height: 30rem;
  }
</style>

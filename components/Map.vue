<template lang="pug">
  div.map-container
    client-only
      <GoogleMap :api-key="useRuntimeConfig().public.GMAPS_KEY" ref="gmap" id="gmap" v-bind="{...options, zoom: 14, minZoom: isMobile ? 1 : 2, ...overrideOptions}" @zoom_changed="zoomChanged" @idle="handleIdle">
        <Marker v-if="ready" v-for="marker in markers" v-bind="marker" :key="marker.id" @emit="({ marker, name }) => emit(name, marker)"/>
      </GoogleMap>
      ul(v-if="loaded").zoom-control-list
        li
          button(type="button" @click="setZoom(zoom + 1)" :disabled="zoomInHidden").zoom-control-button
            span.sr-only Zoom in
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect fill="currentColor" x="4.5089" y="10.8594" width="14.9821" height="2.2813" rx="1.0476"/>
              <rect fill="currentColor" x="10.8594" y="4.5089" width="2.2813" height="14.9821" rx="1.0476"/>
            </svg>
        li
          button(type="button" @click="setZoom(zoom - 1)" :disabled="zoomOutHidden").zoom-control-button
            span.sr-only Zoom out
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect fill="currentColor" x="4.5089" y="10.8594" width="14.9821" height="2.2813" rx="1.0476"/>
            </svg>
</template>

<script setup lang="ts">
  import { GoogleMap, Marker as GoogleMarker } from "vue3-google-map"
  const { map } = useAppConfig()
  const isMobile = useTrollBreakpoints()?.smallerOrEqual("map") ?? false
  const gmap = ref(null)
  const center = { lat: 41.495, lng: -71.712 }
  const options = { ...mapOptions, ...map }
  const zoomInHidden = computed(() => zoom.value >= mapOptions.maxZoom)
  const zoomOutHidden = computed(() => zoom.value <= (isMobile.value ? 1 : 2))
  const fitBoundsLastCalled = ref<null | Date>(null)
  const overlay = ref<null | google.maps.OverlayView>(null)
  const labelOverlay = ref<null | google.maps.OverlayView>(null)
  const ready = ref(false)
  const hasIdled = ref(false)
  const loaded = ref(false)

  const water = map.styles.find(({ featureType }) => featureType === "water")
  if (water !== undefined) {
    options.backgroundColor = water.stylers[0].color
  }

  const emit = defineEmits<{
    (e: "ready"): void
    (e: "loaded"): void
    (e: "zoomChanged", { zoom, level }: { zoom: number; level: string }): void
    (e: "markerClick", marker: Marker): void
    (e: "markerMouseOver", marker: Marker): void
    (e: "markerMouseOut", marker: Marker): void
    (e: "markerDragend", marker: Marker): void
  }>()

  const props = withDefaults(
    defineProps<{
      markers: Marker[]
      ready: boolean
      initialZoom?: number
      initialLevel?: string
      overrideOptions?: object
    }>(),
    {
      initialZoom: 2,
      initialLevel: "country",
      overrideOptions: {},
    }
  )

  const zoom = ref(props.initialZoom)
  const level = ref(props.initialLevel)

  watch(
    () => gmap.value?.ready,
    value => {
      if (!value) return
      ready.value = true
      overlay.value = initOverlay(google, gmap.value.map)
      labelOverlay.value = initLabelOverlay(google, gmap.value.map)
      emit("ready")

      useResizeObserver(
        gmap.value.$el,
        useDebounceFn(() => {
          fitbounds()
        }, 250)
      )
    }
  )

  const watchProp = computed(() => {
    return JSON.stringify({ ready: props.ready, hasIdled: hasIdled.value, mapReady: ready.value })
  })

  watch(
    () => watchProp.value,
    useDebounceFn(async json => {
      if (loaded.value) return

      if (ready.value && props.ready && !hasIdled.value) fitbounds()
      if (hasIdled.value && ready.value && props.ready) {
        loaded.value = true
        emit("loaded")
      }
    }, 10)
  )

  function fitbounds() {
    let now = new Date()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()
    let formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    if (props.markers === undefined || props.markers?.length === 0) return

    fitBoundsLastCalled.value = new Date()

    if (props.markers.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      for (let marker of props.markers) {
        bounds.extend(marker.position)
      }

      now = new Date()
      minutes = now.getMinutes()
      seconds = now.getSeconds()
      formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

      gmap.value?.map?.fitBounds(bounds)
    } else if (props.markers.length !== 0) {
      const [marker] = props.markers

      if (level.value === "country") {
        gmap.value?.map?.setZoom(2)
      } else if (level.value === "polaroid") {
        gmap.value?.map?.setZoom(14)
      } else {
        gmap.value?.map?.setZoom(zoomLevels[getNextLevel(marker)] - 1)
      }

      gmap.value?.map?.setCenter(marker.position)
    }
  }

  function handleIdle() {
    if (!hasIdled.value) {
      hasIdled.value = true
    }
  }

  function setCenter(center: google.maps.LatLngLiteral) {
    gmap.value?.map.setCenter(new google.maps.LatLng(center))
  }

  function setZoom(newZoom: number) {
    gmap.value?.map.setZoom(newZoom)
  }

  const zoomChanged = useDebounceFn(() => {
    zoom.value = gmap.value?.map?.getZoom()
    if (fitBoundsLastCalled.value === null) fitBoundsLastCalled.value = new Date()
    const msSinceFitboundsCalled = new Date().getTime() - fitBoundsLastCalled.value.getTime()

    if (msSinceFitboundsCalled > 400) {
      if (zoom.value <= zoomLevels.country && zoom.value < zoomLevels.state) {
        level.value = "country"
      } else if (zoom.value >= zoomLevels.polaroid) {
        level.value = "polaroid"
      } else if (zoom.value <= zoomLevels.state) {
        level.value = "state"
      } else {
        level.value = "city"
      }

      emit("zoomChanged", { zoom: zoom.value, level: level.value })
    }
  }, 200)

  defineExpose({
    gmap,
    level,
    overlay,
    labelOverlay,
    fitbounds,
    ready,
    options,
    props,
    setZoom,
    setCenter,
  })
</script>

<style lang="scss" scoped>
  .map-container {
    position: relative;
    padding-top: var(--height, clamp(25rem, 50vw, 42.2rem));
  }

  :deep(.mapdiv) {
    position: absolute !important;
    inset: 0;
    transition: opacity $slow;
  }

  .zoom-control-list {
    position: absolute;
    z-index: 100;
    display: flex;
    bottom: var(--position-y, 1.5rem);
    right: var(--position-x, 1rem);
    padding: var(--list-padding, 0.2rem 0);
    background-color: var(--background, white);
    border: var(--border, 1px solid #{$lightest-grey});
    font-size: var(--size, clamp(0.7rem, 1.35vw, 0.9rem));

    @include viewport($medium-viewport up) {
      flex-direction: column;
    }

    & > li {
      @include viewport($medium-viewport down) {
        &:first-child {
          padding-right: 0.35em;
        }

        &:last-child {
          padding-left: 0.35em;
          border-left: var(--divider, 2px solid #{$lightest-grey});
        }
      }

      @include viewport($medium-viewport up) {
        margin: 0.25em 0;

        &:last-child {
          //border-top: 2px solid $lightest-grey;
          &:before {
            content: "";
            display: block;
            border-top: var(--divider, 2px solid #{$lightest-grey});
            margin: 0 5px;
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  .zoom-control-button {
    background: transparent;
    border: none;
    font-size: 1em;
    color: var(--color, $grey);
    transition: color $medium;
    --focus-offset: -0.35em;

    @include viewport($medium-viewport down) {
      padding: var(--mobile-button-padding, 0.5em 1.15em);
    }

    @include viewport($medium-viewport up) {
      padding: var(--desktop-button-padding, 0.35em 0.65em);
    }

    &[disabled] {
      opacity: 0.35;
    }

    &:not([disabled]):hover {
      color: var(--hover-color, #{$dark-grey});
    }
    svg {
      width: var(--icon-size, 2em);
      height: var(--icon-size, 2em);
    }
  }
</style>

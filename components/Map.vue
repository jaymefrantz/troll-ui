<template lang="pug">
  <GoogleMap :zoom="initialZoom" :api-key="useRuntimeConfig().public.GMAPS_KEY" ref="gmap" id="gmap" v-bind="{...options, minZoom: isMobile ? 1 : 2}" @zoom_changed="zoomChanged" @idle="handleIdle">
    <Marker v-if="ready" v-for="marker in markers" v-bind="marker" :key="marker.id" @emit="({ marker, name }) => emit(name, marker)"/>
  </GoogleMap>
  ul(v-if="loaded").zoom-control-list
    li
      button(type="button" @click="setZoom(1)" :disabled="zoomInHidden").zoom-control-button
        span.sr-only Zoom in
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <rect fill="currentColor" x="4.5089" y="10.8594" width="14.9821" height="2.2813" rx="1.0476"/>
          <rect fill="currentColor" x="10.8594" y="4.5089" width="2.2813" height="14.9821" rx="1.0476"/>
        </svg>
    li
      button(type="button" @click="setZoom(-1)" :disabled="zoomOutHidden").zoom-control-button
        span.sr-only Zoom out
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <rect fill="currentColor" x="4.5089" y="10.8594" width="14.9821" height="2.2813" rx="1.0476"/>
        </svg>
</template>

<script setup lang="ts">
  import { useBreakpoints } from '@vueuse/core'
  import { GoogleMap, Marker as GoogleMarker } from "vue3-google-map"
  const breakpoints = useBreakpoints({ map: 821 })
  const isMobile = breakpoints?.smallerOrEqual("map") ?? false
  const { map } = useAppConfig()
  const gmap = ref(null)
  const center = { lat: 41.495, lng: -71.712 }
  const options = { ...mapOptions, ...map }
  const zoomInHidden = computed(() => zoom.value >= mapOptions.maxZoom)
  const zoomOutHidden = computed(() => zoom.value <= (isMobile ? 1 : 2))
  const fitBoundsLastCalled = ref<null | Date>(null)
  const overlay = ref<null | google.maps.OverlayView>(null)
  const labelOverlay = ref<null | google.maps.OverlayView>(null)
  const ready = ref(false)
  const hasIdled = ref(false)
  const loaded = ref(false)

  const water = map.styles.find(({ featureType }) => featureType === "water")
  if(water !== undefined) {
    options.backgroundColor = water.stylers[0].color
  }

  const emit = defineEmits<{
    (e: "ready"): void
    (e: "zoomChanged", { zoom, level }: { zoom: number, level: string }): void
    (e: "markerClick", marker: Marker): void
    (e: "markerMouseOver", marker: Marker): void
    (e: "markerMouseOut", marker: Marker): void
  }>()

  const props = withDefaults(defineProps<{
    initialZoom?: number
    markers: Marker[]
    initialLevel?: string
  }>(), {
    initialZoom: 2,
    initialLevel: "country",
  })

  const zoom = ref(props.initialZoom)
  const level = ref(props.initialLevel)

  watch(
    () => gmap.value?.ready,
    value => {
      if (!value) return
      ready.value = true
      emit("ready")
      overlay.value = initOverlay(google, gmap.value.map)
      labelOverlay.value = initLabelOverlay(google, gmap.value.map)


      useResizeObserver(
        gmap.value.$el,
        useDebounceFn(() => {
          fitbounds()
        }, 250)
      )
    }
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
      const [ marker ] = props.markers

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
    if(!hasIdled.value) {
      hasIdled.value = true
    }
  }

  function setZoom(shift: number) {
    gmap.value?.map.setZoom(zoom.value + shift)
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
    hasIdled,
    options,
    loaded,
  })
</script>

<style lang="scss" scoped>
  #gmap {
    position: relative;
    padding-top: var(--height, clamp(25rem, 50vw, #{rem(675)}));
  }

  :deep(.mapdiv) {
    position: absolute !important;
    inset: 0;
    //transition: opacity $slow;
  }

  .zoom-control-list {
    position: absolute;
    bottom: 1.5rem;
    z-index: 100;
    right: 1rem;
    display: flex;
    // left: 1rem;
    padding: 0.2rem 0;
    box-shadow: 0.15rem 0.225rem 0 rgb(0 0 0 / 10%);
    background-color: white;
    border-radius: 1.75rem;
    border: 1px solid #f7f7f7;
    //color: $grey;

    @include viewport($medium-viewport up) {
      flex-direction: column;
    }

    & > li {
      @include viewport($medium-viewport down) {
        &:first-child {
          padding-right: 0.35rem;
        }

        &:last-child {
          padding-left: 0.35rem;
          //border-left: 2px solid $lightest-grey;
        }
      }

      @include viewport($medium-viewport up) {
        margin: 0.25rem 0;

        &:last-child {
          //border-top: 2px solid $lightest-grey;
        }
      }

      &:last-child {
        // &:before {
        //   content: "";
        //   display: block;
        //   border-top: 2px solid $lightest-grey;
        //   margin: 0 5px;
        //   transform: translateY(-2px);
        // }
      }
    }
  }
  
  .zoom-control-button {
    background: transparent;
    border: none;

    font-size: clamp(0.7rem, 1.35vw, 0.9rem);
    //color: $grey;
    //transition: color $medium;
    --focus-offset: -0.35em;

    @include viewport($medium-viewport down) {
      padding: 0.5em 1.15em;
    }

    @include viewport($medium-viewport up) {
      padding: 0.35em 0.65em;
    }

    &[disabled] {
      opacity: 0.35;
    }
    &:hover {
      //color: $dark-grey;
    }
    svg {
      width: 2em;
      height: 2em;
    }
  }

</style>

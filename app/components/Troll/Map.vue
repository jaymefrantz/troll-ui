<template lang="pug">
  //- pre {{JSON.stringify(markers, null, 2)}}
  div.map-container
    client-only
      <GoogleMap :api-key="useRuntimeConfig().public.GMAPS_KEY" :api-promise="apiPromise" ref="gmap" id="gmap" v-bind="{...options, zoom, minZoom, ...overrideOptions}" @zoom_changed="zoomChanged" @idle="handleIdle">
        <TrollMarker v-if="ready" v-for="marker in markers" v-bind="marker" :key="marker.id" @emit="event => emit(event.name, { ...marker, ...event.marker })"/>
        <component v-if="ready && overlayComponent" :is="overlayComponent" ref="overlay" v-bind="overlayProps" :map="gmap?.map" :api="gmap?.api" />
      </GoogleMap>
      <slot v-if="loaded" name="zoomContol"/>
      ul(v-if="loaded && !slots.zoomContol").zoom-control-list
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
  import { computed, nextTick, ref, shallowRef, useSlots, watch } from "vue"
  import type { Component, ComponentPublicInstance } from "vue"
  import { GoogleMap } from "vue3-google-map"
  import { useDebounceFn, useResizeObserver } from "@vueuse/core"
  import { useAppConfig, useRuntimeConfig } from "#imports"
  import { useTrollBreakpoints } from "../../composables/useTrollBreakpoints"
  import { mapOptions } from "../../utils/gmap"
  import { getNextLevel } from "../../utils/gmap/polaroids"
  import type { MapMarker, MapMarkerEvent, MapPosition } from "../../types/gmap"

  const props = withDefaults(
    defineProps<{
      markers?: MapMarker[]
      initialZoom?: number
      initialLevel?: string
      overrideOptions?: google.maps.MapOptions
      overlayComponent?: Component | null
      overlayProps?: Record<string, unknown>
      apiPromise?: Promise<typeof google>
    }>(),
    {
      markers: () => [],
      initialZoom: 2,
      initialLevel: "country",
      overrideOptions: () => ({}),
      overlayComponent: null,
      overlayProps: () => ({}),
    }
  )

  const { map } = useAppConfig()
  const slots = useSlots()
  const isMobile = useTrollBreakpoints()?.smallerOrEqual("map") ?? ref(false)
  const gmap = shallowRef<InstanceType<typeof GoogleMap> | null>(null)
  const options = { ...mapOptions, ...map }
  const overlay = shallowRef<ComponentPublicInstance | null>(null)
  const ready = ref(false)
  const hasIdled = ref(false)
  const loaded = ref(false)
  const zoom = ref(props.initialZoom)
  const level = ref(props.initialLevel)
  const fitBoundsLastCalled = ref<Date | null>(null)
  const minZoom = computed(() => props.overrideOptions.minZoom ?? map?.minZoom ?? (isMobile.value ? 1 : 2))
  const maxZoom = computed(() => props.overrideOptions.maxZoom ?? options.maxZoom ?? mapOptions.maxZoom)
  const zoomInHidden = computed(() => zoom.value >= maxZoom.value)
  const zoomOutHidden = computed(() => zoom.value <= minZoom.value)

  const zoomLevels: Record<string, number> = {
    country: 3,
    state: 5,
    polaroid: 9,
    city: 7,
    ...map?.zoomLevels,
  }

  const water = map?.styles?.find(({ featureType }) => featureType === "water")
  const waterStyle = water?.stylers?.[0]
  if (waterStyle && "color" in waterStyle && typeof waterStyle.color === "string") options.backgroundColor = waterStyle.color

  const emit = defineEmits<{
    (e: "ready"): void
    (e: "loaded"): void
    (e: "zoomChanged", value: { zoom: number; level: string }): void
    (e: "markerClick" | "markerMouseOver" | "markerMouseOut" | "markerDragend", marker: MapMarkerEvent): void
  }>()

  watch(
    () => gmap.value?.ready,
    async (value, _previous, onCleanup) => {
      ready.value = Boolean(value)
      if (!value) return
      fitbounds()
      let active = true
      let stopResize: (() => void) | undefined
      onCleanup(() => {
        active = false
        stopResize?.()
      })
      // A synchronously imported preset is mounted before the ready event reaches the app.
      await nextTick()
      if (!active || !gmap.value) return
      emit("ready")
      let first = true
      const observer = useResizeObserver(
        gmap.value.$el,
        useDebounceFn(() => {
          if (!first) fitbounds()
          first = false
        }, 250)
      )
      stopResize = observer.stop
    }
  )

  watch(
    [hasIdled, ready],
    useDebounceFn(() => {
      if (loaded.value) return
      if (hasIdled.value && ready.value) {
        loaded.value = true
        emit("loaded")
      }
    }, 10)
  )

  function fitbounds() {
    const nativeMap = gmap.value?.map
    const api = gmap.value?.api
    if (!nativeMap || !api || props.markers.length === 0) return
    fitBoundsLastCalled.value = new Date()

    if (props.markers.length > 1) {
      const bounds = new api.LatLngBounds()
      for (const marker of props.markers) bounds.extend(marker.position)
      nativeMap.fitBounds(bounds)
      return
    }

    const [marker] = props.markers
    if (marker.level === undefined) {
      // A plain marker has no location hierarchy; keep the current map zoom.
      nativeMap.setZoom(zoom.value)
    } else if (level.value === "country" || level.value === "continent") {
      nativeMap.setZoom(2)
    } else if (level.value === "polaroid") {
      nativeMap.setZoom(14)
    } else {
      const nextLevel = getNextLevel({ level: marker.level, title: marker.title ?? "" })
      nativeMap.setZoom((zoomLevels[nextLevel] ?? props.initialZoom + 1) - 1)
    }
    nativeMap.setCenter(marker.position)
  }

  function handleIdle() {
    hasIdled.value = true
  }

  function setCenter(center: MapPosition) {
    gmap.value?.map?.setCenter(center)
  }

  function setZoom(newZoom: number) {
    gmap.value?.map?.setZoom(newZoom)
  }

  const zoomChanged = useDebounceFn(() => {
    const currentZoom = gmap.value?.map?.getZoom()
    if (currentZoom === undefined) return
    zoom.value = currentZoom
    if (fitBoundsLastCalled.value === null) fitBoundsLastCalled.value = new Date()
    const msSinceFitboundsCalled = Date.now() - fitBoundsLastCalled.value.getTime()
    if (msSinceFitboundsCalled <= 400) return

    if (zoomLevels.continent !== undefined && zoom.value <= zoomLevels.continent) {
      level.value = "continent"
    } else if (zoom.value <= zoomLevels.country && zoom.value < zoomLevels.state) {
      level.value = "country"
    } else if (zoom.value >= zoomLevels.polaroid) {
      level.value = "polaroid"
    } else if (zoom.value <= zoomLevels.state) {
      level.value = "state"
    } else {
      level.value = "city"
    }
    emit("zoomChanged", { zoom: zoom.value, level: level.value })
  }, 200)

  defineExpose({
    gmap,
    level,
    overlay,
    fitbounds,
    ready,
    loaded,
    options,
    props,
    setZoom,
    setCenter,
    zoomLevels,
    zoomControls: {
      zoomInHidden,
      zoomOutHidden,
      zoom,
      level,
      zoomIn: () => { if (!zoomInHidden.value) setZoom(zoom.value + 1) },
      zoomOut: () => { if (!zoomOutHidden.value) setZoom(zoom.value - 1) },
    },
  })
</script>

<style scoped>
  :global([title="Map camera controls"]) {
    display: none !important;
  }

  .map-container {
    position: relative;
    padding-top: var(--height, clamp(25rem, 50vw, 42.2rem));
  }

  :deep(.mapdiv) {
    position: absolute !important;
    inset: 0;
    transition: opacity var(--troll-ui-ani-slow);
  }

  .zoom-control-list {
    position: absolute;
    z-index: 100;
    display: flex;
    bottom: var(--position-y, 1.5rem);
    right: var(--position-x, 1rem);
    padding: var(--list-padding, 0.2rem 0);
    background-color: var(--background, white);
    border: var(--border, 1px solid var(--troll-ui-lightest-grey));
    font-size: var(--size, clamp(0.7rem, 1.35vw, 0.9rem));

    @viewport (medium-viewport up) {
      flex-direction: column;
    }

    & > li {
      @viewport (medium-viewport down) {
        &:first-child {
          padding-right: 0.35em;
        }

        &:last-child {
          padding-left: 0.35em;
          border-left: var(--divider, 2px solid var(--troll-ui-lightest-grey));
        }
      }

      @viewport (medium-viewport up) {
        margin: 0.25em 0;

        &:last-child {
          &:before {
            content: "";
            display: block;
            border-top: var(--divider, 2px solid var(--troll-ui-lightest-grey));
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
    color: var(--color, var(--troll-ui-grey));
    transition: color var(--troll-ui-ani-medium);
    --focus-offset: -0.35em;

    @viewport (medium-viewport down) {
      padding: var(--mobile-button-padding, 0.5em 1.15em);
    }

    @viewport (medium-viewport up) {
      padding: var(--desktop-button-padding, 0.35em 0.65em);
    }

    &[disabled] {
      opacity: 0.35;
    }

    &:not([disabled]):hover {
      color: var(--hover-color, var(--troll-ui-dark-grey));
    }
    svg {
      width: var(--icon-size, 2em);
      height: var(--icon-size, 2em);
    }
  }
</style>

<template>
  <Teleport v-if="container" :to="container">
    <div>
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue"
  import type { MapPosition } from "../../types/gmap"

  const props = withDefaults(
    defineProps<{
      map?: google.maps.Map | null
      api?: typeof google.maps | null
      position: MapPosition
      open?: boolean
      anchor?: "top-left" | "center" | "bottom-center"
      offsetX?: number
      offsetY?: number
      zIndex?: number
    }>(),
    {
      open: false,
      anchor: "bottom-center",
      offsetX: 0,
      offsetY: 0,
      zIndex: 0,
    }
  )

  const container = shallowRef<HTMLElement | null>(null)
  let overlay: google.maps.OverlayView | null = null

  const overlayTransform = computed(() => {
    const anchors = {
      "top-left": "0, 0",
      center: "-50%, -50%",
      "bottom-center": "-50%, -100%",
    }

    return `translate(${props.offsetX}px, ${props.offsetY}px) translate(${anchors[props.anchor]})`
  })

  // Google Maps and document are only accessed after mounting, including when open is initially true.
  onMounted(() => {
    watch(
      [() => props.open, () => props.map, () => props.api],
      ([open, map, api], _previous, onCleanup) => {
        const maps = api ?? window.google?.maps
        if (!open || !map || !maps) return

        class VueOverlay extends maps.OverlayView {
          element: HTMLDivElement | null = null

          onAdd() {
            const panes = this.getPanes()
            if (!panes) return

            this.element = document.createElement("div")
            this.element.className = "troll-map-overlay"
            this.element.style.position = "absolute"
            // Move the actual Maps element, so its hit area moves with the card.
            // Transforming only the child leaves an invisible box below the marker.
            this.element.style.transform = overlayTransform.value
            this.element.style.zIndex = String(props.zIndex)
            // A button or scrollable panel inside the overlay should not also move the map.
            maps.OverlayView.preventMapHitsAndGesturesFrom(this.element)
            panes.floatPane.appendChild(this.element)
            container.value = this.element
          }

          draw() {
            const projection = this.getProjection()
            if (!this.element || !projection) return

            const point = projection.fromLatLngToDivPixel(new maps.LatLng(props.position))
            if (!point) return

            this.element.style.left = `${point.x}px`
            this.element.style.top = `${point.y}px`
          }

          onRemove() {
            if (container.value === this.element) container.value = null
            this.element?.remove()
            this.element = null
          }
        }

        const instance = new VueOverlay()
        overlay = instance
        instance.setMap(map)

        onCleanup(() => {
          instance.setMap(null)
          if (overlay === instance) overlay = null
        })
      },
      { immediate: true }
    )
  })

  watch([() => props.position.lat, () => props.position.lng], () => overlay?.draw())
  watch(overlayTransform, value => {
    if (container.value) container.value.style.transform = value
  })
  watch(
    () => props.zIndex,
    value => {
      if (container.value) container.value.style.zIndex = String(value)
    }
  )

  onBeforeUnmount(() => overlay?.setMap(null))
</script>

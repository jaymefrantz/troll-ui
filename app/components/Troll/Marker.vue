<template lang="pug">
  <GoogleMarker :options="markerOptions" ref="gmapMarker" @click="handleEvent('markerClick')" @dragend="dragend" @mouseover="handleMouseOver" @mouseout="handleMouseOut"/>
</template>

<script setup lang="ts">
  import { computed, ref, shallowRef } from "vue"
  import { Marker as GoogleMarker } from "vue3-google-map"
  import type { MapMarker, MapMarkerEvent, MapMarkerEventName } from "../../types/gmap"
  import "../../assets/ui/scss/map-overlays.css"

  // vue3-google-map exposes marker at runtime, but omits it from this version's component declaration.
  const gmapMarker = shallowRef<MapMarkerEvent["gmapMarker"]>(null)
  const emit = defineEmits<{
    (e: "emit", event: { name: MapMarkerEventName; marker: MapMarkerEvent }): void
  }>()
  const marker = withDefaults(defineProps<MapMarker>(), {
    color: "#6d6f73",
    options: () => ({}),
    image: "",
  })
  const hovered = ref(false)

  const label = computed(() => {
    if (marker.level === "polaroid") return {}
    const value = marker.label ?? marker.polaroids?.length
    if (value === undefined || value === "") return {}
    const count = Number(value)
    return {
      label: {
        text: String(value),
        fontSize: count >= 100 ? "10px" : count >= 10 ? "12px" : "14px",
        fontWeight: "bold",
        color: marker.color,
        className: "marker-label",
      },
    }
  })

  const iconOptions = {
    size: new google.maps.Size(36, 48),
    anchor: new google.maps.Point(18, 48),
    labelOrigin: new google.maps.Point(18, 19),
    scaledSize: new google.maps.Size(36, 48),
  }

  const markerOptions = computed<google.maps.MarkerOptions>(() => {
    const icon = hovered.value && marker.hoverIcon !== undefined ? marker.hoverIcon : marker.icon
    return {
      position: marker.position,
      title: marker.title,
      clickable: true,
      ...label.value,
      ...(icon !== undefined ? { icon: { url: icon, ...iconOptions, ...marker.iconOptions } } : {}),
      ...marker.options,
    }
  })

  function dragend({ latLng }: { latLng: google.maps.LatLng }) {
    if (latLng) handleEvent("markerDragend", { newPosition: { lat: latLng.lat(), lng: latLng.lng() } })
  }

  function handleMouseOver() {
    hovered.value = true
    handleEvent("markerMouseOver")
  }

  function handleMouseOut() {
    hovered.value = false
    handleEvent("markerMouseOut")
  }

  function handleEvent(name: MapMarkerEventName, additional: Partial<MapMarkerEvent> = {}) {
    emit("emit", { name, marker: { ...marker, gmapMarker: gmapMarker.value, ...additional } })
  }
</script>

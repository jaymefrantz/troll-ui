<template lang="pug">
  <Map ref="map" :markers="zoomedMarkers.map(marker => ({ ...marker, icon, hoverIcon }))" @markerClick="markerClick" @markerMouseOver="markerMouseOver" @markerMouseOut="markerMouseOut"/>
</template>

<script setup lang="ts">
  import icon from "./assets/svg/map-marker.svg?url"
  import hoverIcon from "./assets/svg/map-marker-hover.svg?url"
  const { data } = await useAsyncData("playground", () => $fetch(`${useRuntimeConfig().public.API}/polaroid/random`))
  const map = ref(null)
  let timeoutId: ReturnType<typeof setTimeout> //this is needed for delaying the show of previews on hover

  const zoomedMarkers = computed(() => {
    if(map.value === null) return []
    const polaroids = data.value.markers.filter(marker => marker.level === "polaroid").map(({ id }) => id)

    return getZoomedMarkers(map.value.level, data.value.markers).map(marker => {
      if(marker.level !== "polaroid") {
        marker.count = marker.polaroids.filter(id => polaroids.includes(id)).length
      }
      return marker
    })
  })

  function markerClick(marker: Marker) {
    if (map.value.level !== "polaroid" && marker.link !== undefined) {
      //useRouter().push({ path: link.value, query: useRoute().query })
      map.value.overlay.hideLabel(marker)
    } else if (map.value.level === "polaroid") {
      map.value.overlay.polaroidClicked(marker.id)
    }
  }

  function markerMouseOut(marker: Marker) {
    clearTimeout(timeoutId)
    marker.gmapMarker.marker.setZIndex(10)
    if (marker.level !== "polaroid") {
       map.value.overlay.hideLabel(marker)
    } else {
      map.value.overlay.removePreview(marker.id)
    }
  }

  function markerMouseOver(marker: Marker) {
    clearTimeout(timeoutId)
    marker.gmapMarker.marker.setZIndex(100)
    if (marker.level !== "polaroid" && marker.title !== "") {
      map.value.overlay.showLabel(marker)
    } else if (marker.level === "polaroid") {
      timeoutId = setTimeout(() => {
        map.value.overlay.addPolaroid({ id: marker.id, image: `${useRuntimeConfig().public.CLOUDINARY}/polaroids/${marker.id}.jpg`, position: marker.position })
      }, 250)
    }
  }
</script>

<style lang="scss" scoped></style>
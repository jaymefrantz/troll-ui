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
    return getZoomedMarkers(map.value.level, data.value.markers)
  })

  function markerClick(marker: Marker) {
    console.log(marker.id);
    
    //map.value.overlay.polaroidClicked(marker.polaroids[0])
    
    // if (level.value !== "polaroid" && link.value !== undefined) {
    //   useRouter().push({ path: link.value, query: useRoute().query })
    //   store.overlay.hideLabel(marker)
    // } else if (level.value === "polaroid") {
    //   store.overlay.polaroidClicked(polaroidIds.value[0])
    // }
  }

  function markerMouseOut(marker: Marker) {
    //console.log("markerMouseOut?", marker);
    clearTimeout(timeoutId)
    marker.gmapMarker.marker.setZIndex(10)
    if (marker.level !== "polaroid") {
      //console.log(map.value.overlay);
      map.value.overlay.hideLabel(marker)
    } else {
      //store.overlay.removePreview(polaroidIds.value[0])
    }
  }

  function markerMouseOver(marker: Marker) {
    clearTimeout(timeoutId)
    marker.gmapMarker.marker.setZIndex(100)
    if (marker.level !== "polaroid" && marker.title !== "") {
      map.value.overlay.showLabel(marker)
    } else if (marker.level === "polaroid") {
      // timeoutId = setTimeout(() => {
      //   const id = polaroidIds.value[0]
      //   store.overlay.addPolaroid({ id, image: `${useRuntimeConfig().public.CLOUDINARY}/polaroids/${id}.jpg`, position: position.value })
      // }, 250)
    }
  }
</script>

<style lang="scss" scoped></style>
<template lang="pug">
div(style="position: relative;")
	<Map ref="map" :ready="true" :markers="zoomedMarkers.map(marker => ({ ...marker, icon, hoverIcon }))" @markerClick="markerClick" @markerMouseOver="markerMouseOver" @markerMouseOut="markerMouseOut"/>
</template>

<script setup lang="ts">
	import icon from "./assets/svg/map-marker.svg?url"
	import hoverIcon from "./assets/svg/map-marker-hover.svg?url"
	const { data } = await useAsyncData("playground", () => $fetch(`${useRuntimeConfig().public.API}/polaroid/random`))
	const map = ref(null)
	// const initialLevel = "polaroid"
	// const initialZoom = zoomLevels[initialLevel] + 1
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

<style lang="scss">
	.zoom-control-list {
		box-shadow: 0.15rem 0.225rem 0 rgb(0 0 0 / 10%);
		border-radius: 1.75rem;
	}

	#marker-location-label {
		border-radius: 6px;
	}

	.marker-preview-container {
		box-shadow: 0.1rem 0.3rem 0 rgb(0 0 0 / 8%), -0.125rem -0.125rem 0 rgb(0 0 0 / 5%), 0.4rem 0.15rem 0 rgb(0 0 0 / 5%);
		&:before {
			filter: drop-shadow(0.1em 0.3em 0 rgba(0, 0, 0, 0.08)) drop-shadow(-0.125em -0.125em 0 rgba(0, 0, 0, 0.05)) drop-shadow(0.4em 0.15em 0 rgba(0, 0, 0, 0.05));
		}
	}

	.marker-preview {
		border-radius: 3px;
	}

	.marker-preview-image-wrap {
		border-radius: 2px;
		overflow: hidden;
	}
</style>
<template lang="pug">
//- pre {{ markers.filter(({ level }) => level === "polaroid").map(({ title }) => title) }}
button(type="button" @click="refresh").refresh-button 
	<Icon class="icon" size="18" name="material-symbols-light:refresh-rounded" />
	span refresh
<Map ref="map" :ready="true" :markers="zoomedMarkers.map(marker => ({ ...marker, icon, color: '#e4e4e7' }))" @markerClick="markerClick" @markerMouseOver="markerMouseOver" @markerMouseOut="markerMouseOut"/>
<Props :props="props" />
</template>

<script setup lang="ts">
  import icon from "./assets/svg/map-marker.svg?url"
  const { data, refresh } = await useFetch(`${useRuntimeConfig().public.API}/polaroids/random`, {
    pick: ["markers"],
  })

  const map = ref(null)
  const markers = ref(data.value.markers)
  let timeoutId: ReturnType<typeof setTimeout> //this is needed for delaying the show of previews on hover

  const zoomedMarkers = computed(() => {
    if (map.value === null) return []
    const polaroids = markers.value
      .filter(marker => marker.level === "polaroid")
      .map(({ id }) => id)

    return getZoomedMarkers(map.value.level, markers.value).map(marker => {
      if (marker.level !== "polaroid") {
        marker.count = marker.polaroids.filter(id => polaroids.includes(id)).length
      }
      return marker
    })
  })

  // const zoomedMarkers = ref([
  //   {
  //     id: "United States",
  //     title: "United States",
  //     position: { lat: 38, lng: -97 },
  //     level: "country",
  //     polaroids: [
  //       "676311aa36d79827700dfe21",
  //       "676311c036d79827700dfe66",
  //       "6763119736d79827700dfe08",
  //       "676311a936d79827700dfe13",
  //       "676311a936d79827700dfe15",
  //       "6763117736d79827700dfd9b",
  //       "676311bf36d79827700dfe5c",
  //     ],
  //     link: "/united-states",
  //     count: 7,
  //   },
  //   {
  //     id: "Canada",
  //     title: "Canada",
  //     position: { lat: 54.85, lng: -94.37 },
  //     level: "country",
  //     polaroids: [
  //       "6763119536d79827700dfde7",
  //       "6763119536d79827700dfdeb",
  //       "676311aa36d79827700dfe26",
  //       "676311aa36d79827700dfe2c",
  //       "676311ab36d79827700dfe35",
  //     ],
  //     link: "/canada",
  //     count: 5,
  //   },
  //   {
  //     id: "Mexico",
  //     title: "Mexico",
  //     position: { lat: 23, lng: -102 },
  //     level: "country",
  //     polaroids: [
  //       "676311c036d79827700dfe72",
  //       "676311cc36d79827700dfe87",
  //       "676311cc36d79827700dfe89",
  //       "676311cc36d79827700dfe91",
  //       "676311ce36d79827700dfe9d",
  //       "676311ce36d79827700dfea0",
  //       "676311ce36d79827700dfea3",
  //       "676311cf36d79827700dfea6",
  //     ],
  //     link: "/mexico",
  //     count: 8,
  //   },
  // ])

  async function markerClick(marker: Marker) {
    if (map.value.level !== "polaroid") {
      map.value.overlay.hideLabel(marker)
      markers.value = data.value.markers.filter(({ polaroids }) =>
        polaroids.find(id => marker.polaroids.includes(id))
      )
      map.value.level = getNextLevel(marker)
      await wait(100)
      map.value.fitbounds()
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
        map.value.overlay.addPolaroid({
          id: marker.id,
          image: marker.image,
          position: marker.position,
        })
      }, 250)
    }
  }

  watch(
    () => data.value.markers,
    async value => {
      map.value.overlay.removeAllPreviews()
      await wait(10)
      markers.value = value
      map.value.level = "country"
      map.value.gmap.map.setZoom(2)
    }
  )

  const props = computed(() => Object.keys(map.value?.props ?? {}))
</script>

<style lang="scss">
  .map-container {
    padding: 0.5rem;
    border: 1px solid var(--primary);
    border-radius: 0.35rem;
    position: relative;
  }

  #gmap {
    border-radius: 0.35rem;
    overflow: hidden;
  }

  .refresh-button {
    margin-bottom: 2em;
    margin-left: 0.5em;
    margin-top: 0.5em;
    padding: 0.875em 1em;
    border: var(--border);
    border-radius: var(--border-radius);
    font-size: 0.875em;
    color: var(--dark-200);
    transition: background-color $medium-fast;
    display: inline-block;
    background: transparent;

    .icon {
      margin-right: 0.5em;
      transition: all $medium-fast;
    }

    &:hover {
      background-color: var(--dark-800);

      .icon {
        color: var(--primary);
        rotate: 90deg;
      }
    }
  }

  // .marker-preview-container {
  // 	box-shadow: 0.1rem 0.3rem 0 rgb(0 0 0 / 8%), -0.125rem -0.125rem 0 rgb(0 0 0 / 5%), 0.4rem 0.15rem 0 rgb(0 0 0 / 5%);
  // 	&:before {
  // 		filter: drop-shadow(0.1em 0.3em 0 rgba(0, 0, 0, 0.08)) drop-shadow(-0.125em -0.125em 0 rgba(0, 0, 0, 0.05)) drop-shadow(0.4em 0.15em 0 rgba(0, 0, 0, 0.05));
  // 	}
  // }

  .marker-preview-image-wrap {
    border-radius: 1px;
    overflow: hidden;
  }

  .marker-preview {
    border-radius: 0.25rem;
  }

  #marker-location-label {
    border-radius: 4px;
    --background: #111;
    --padding: 0.4rem 0.6rem;
    --color: var(--dark-400);
    --border: 1px solid var(--primary);
  }

  .marker-preview-container {
    --arrow-color: #111;
    --preview-background: #111;
    --preview-padding: 0.4rem 0.6rem;
    --offset-x: 18px;
    --arrow-size: 0;
    border: 1px solid var(--primary);
    border-radius: 0.15rem;
  }

  .zoom-control-list {
    --position-y: 1.85rem;
    --position-x: 1.25rem;
    --background: #111;
    --color: #d4d4d8;
    --divider: 1px solid var(--dark-600);
    --hover-color: white;
    border-radius: 0.35rem;

    & > li {
      position: relative;

      // &:last-child:after {
      // 	content: "";
      // 	position: absolute;
      // 	top: -1px;
      // 	display: block;
      // 	border-top: 1px solid var(--dark-400);
      // 	right: 6px;
      // 	left: 6px;
      // }
    }
  }
</style>

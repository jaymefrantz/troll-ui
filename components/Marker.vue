<template lang="pug">
  <GoogleMarker :options="markerOptions" ref="gmapMarker" @click="handleEvent('markerClick')" @mouseover="handleEvent('markerMouseOver'); hovered = true" @mouseout="handleEvent('markerMouseOut'); hovered = false"/>
</template>

<script setup lang="ts">
  import { Marker as GoogleMarker } from "vue3-google-map"
  const gmapMarker = ref(null)
  const emit = defineEmits<{
    (e: "emit", { name, marker }: {name: string, marker: Marker}): void
  }>()

  const marker = defineProps<{
    id: string
    title: string
    link: string
    polaroids: string[]
    position: {
      lat: number
      lng: number
    }
    level: string
    icon: string
    hoverIcon: string
    count?: number
  }>()

  const { position, level, polaroids: polaroidIds, link, title, count, icon, hoverIcon } = toRefs(marker)
  const hovered = ref(false)

  const label = computed(() => {
    let size = "14px"
    let polaroidCount = count?.value ?? polaroidIds.value.length

    if (polaroidCount >= 100) {
      size = "10px"
    } else if (polaroidCount >= 10) {
      size = "12px"
    }

    if (level.value !== "polaroid") {
      return { label: { text: polaroidCount.toString(), fontSize: size, fontWeight: "bold", color: "#6d6f73" } }
    } else {
      return {} //hopefully this is ok
    }
  })

  const iconOptions = {
    size: new google.maps.Size(36, 48),
    anchor: new google.maps.Point(18, 48),
    labelOrigin: new google.maps.Point(18, 19),
    scaledSize: new google.maps.Size(36, 48),
    optimized: false,
  }

  const markerOptions = computed(() => {
    return { position: position.value, clickable: true, icon: { url: !hovered.value ? icon.value : hoverIcon.value, ...iconOptions }, ...label.value }
  })

  function handleEvent(name: string) {
    emit('emit', { name, marker: {...marker, gmapMarker: gmapMarker.value }})
  }
</script>

<style lang="scss">
//marker-location-label
#marker-location-label {
    position: absolute;
    background: white;
    padding: 8px;
    border: 2px solid #e3e3e3;
    transform: translateY(-40px) translateX(16px);
    white-space: nowrap;
    //color: $grey;
    border-radius: 6px;
    visibility: hidden;
    opacity: 0;
    font-size: 1.2em;
    // transition: all 0.1s ease-in-out;

    &.shown {
      opacity: 1;
      visibility: visible;
      transform: translateY(-40px) translateX(20px);
    }
  }

  .marker-preview-container {
    transform: translate(10px, -75px);
    opacity: 0;
    position: absolute;
    box-shadow: 0.1rem 0.3rem 0 rgb(0 0 0 / 8%), -0.125rem -0.125rem 0 rgb(0 0 0 / 5%), 0.4rem 0.15rem 0 rgb(0 0 0 / 5%);
    pointer-events: none;
    //transition: opacity $medium-fast ease-in-out, transform $medium-fast ease-in-out;

    &.shown {
      opacity: 1;
      transform: translate(34px, -75px);
      pointer-events: all;

      &:before {
        transform: translateY(-50%) translateX(-1.65em);
      }
    }

    &.leave {
      //transition-duration: 0s !important;
      //transition: opacity $fast !important;
      opacity: 0 !important;
      transform: translate(34px, -75px) !important;
      // border: 2px solid red;
    }

    &:before {
      content: "";
      font-size: 0.55rem;
      display: block;
      position: absolute;
      color: #fff;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 1.875em 1.625em 1.875em 0;
      border-color: transparent currentColor transparent transparent;
      transform: translateY(-50%) translateX(0);
      top: 50%;
      z-index: 0;
      //transition: transform 0.15s ease-out $medium-fast;
      filter: drop-shadow(0.1em 0.3em 0 rgba(0, 0, 0, 0.08)) drop-shadow(-0.125em -0.125em 0 rgba(0, 0, 0, 0.05)) drop-shadow(0.4em 0.15em 0 rgba(0, 0, 0, 0.05));
    }
  }
  .marker-preview {
    width: 140px;
    z-index: 10;
    border-radius: 3px;
    background-color: white;
    padding: 6px;
    position: relative;
  }
  .close-preview-button {
    --focus-offset: 2px;
    position: absolute;
    padding: 0.35rem 0.25rem 0.1rem;
    z-index: 10;
    right: 0.75rem;
    top: 0.75rem;
    background: rgba(white, 0.25);
    border: 0;

    &:after {
      content: url('data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" fill="rgb(22, 27, 34)" viewBox="0 0 24 24"><path d="M14.1945,12.07,20.8417,5.423A1.4367,1.4367,0,1,0,18.81,3.3912L12,10.2012l-6.81-6.81A1.4367,1.4367,0,0,0,3.1583,5.423L9.8055,12.07,3.1583,18.7173A1.4367,1.4367,0,1,0,5.19,20.7491l6.81-6.81,6.81,6.81a1.4367,1.4367,0,1,0,2.0318-2.0318Z"/></svg>');
      display: block;
      width: 1.15rem;
      margin-left: auto;
    }
  }
  .marker-preview-image-wrap {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    img {
      width: 100%;
      //aspect-ratio: 128/103;
    }
  }
</style>

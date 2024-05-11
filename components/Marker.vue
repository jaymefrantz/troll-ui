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
    link?: string
    polaroids: string[]
    position: {
      lat: number
      lng: number
    }
    level: string
    icon?: string
    hoverIcon?: string
    label?: number
  }>()

  const { position, level, polaroids: polaroidIds, link, title } = toRefs(marker)
  const hovered = ref(false)

  const label = computed(() => {
    let size = "14px"
    let polaroidCount = marker?.label ?? polaroidIds.value.length

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
    let obj = { position: position.value, clickable: true, ...label.value }
    const icon = !hovered.value ? marker.icon : marker.hoverIcon
    if(icon !== undefined) {
      obj.icon = { url: icon, ...iconOptions } 
    }
    
    return obj
  })

  function handleEvent(name: string) {
    emit('emit', { name, marker: {...marker, gmapMarker: gmapMarker.value }})
  }
</script>

<style lang="scss">
  #marker-location-label {
    --size: var(--marker-size, 32px);
    --offset-y: calc((var(--size) * -1) - 8px);
    --offset-x: 20px;
    position: absolute;
    visibility: hidden;
    opacity: 0;
    white-space: nowrap;
    background: var(--background, white);
    padding: var(--padding, 0.4rem);
    border: var(--border, 2px solid #e3e3e3);
    translate: calc(var(--offset-x) - 4px) var(--offset-y);
    color: var(--color, $grey);
    font-size: --var(--font-size, 1.2em);
    transition: translate $fast ease-in-out, opacity $medium-fast ease-in-out;

    &.shown {
      opacity: 1;
      visibility: visible;
      translate: var(--offset-x) var(--offset-y);
    }
  }

  .marker-preview-container {
    --offset-y: -75px;
    --offset-x: 34px;
    opacity: 0;
    position: absolute;
    pointer-events: none;
    transition: opacity $medium-fast ease-in-out, translate $medium-fast ease-in-out;
    translate: var(--offset-x) var(--offset-y);

    &:not(.shown):not(.leave) {
      translate: 10px var(--offset-y);
    }

    &.shown {
      opacity: 1;
      pointer-events: all;

      &:before {
        transform: translateY(-50%) translateX(-1.625em);
      }
    }

    &.leave {
      transition-duration: 0s !important;
      transition: opacity $fast !important;
      opacity: 0 !important;
      // border: 2px solid red;
    }

    &:before {
      content: "";
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
      border-color: transparent currentColor transparent transparent;
      transform: translateY(-50%) translateX(0);
      top: 50%;
      z-index: 0;
      transition: transform 0.15s ease-out $medium-fast;
      border-width: var(--arrow-width, 1.875em 1.625em 1.875em 0);
      font-size: var(--arrow-size, 0.55rem);
      color: var(--arrow-color, #fff);
    }
  }
  .marker-preview {
    z-index: 10;
    position: relative;
    width: var(--preview-width, 140px);
    background-color: var(--preview-background, white);
    padding: var(--preview-padding, 6px);
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
      content: var(--x-icon, url('data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" fill="rgb(22, 27, 34)" viewBox="0 0 24 24"><path d="M14.1945,12.07,20.8417,5.423A1.4367,1.4367,0,1,0,18.81,3.3912L12,10.2012l-6.81-6.81A1.4367,1.4367,0,0,0,3.1583,5.423L9.8055,12.07,3.1583,18.7173A1.4367,1.4367,0,1,0,5.19,20.7491l6.81-6.81,6.81,6.81a1.4367,1.4367,0,1,0,2.0318-2.0318Z"/></svg>'));
      display: block;
      width: 1.15rem;
      margin-left: auto;
    }
  }
  .marker-preview-image-wrap {
    position: relative;

    img {
      width: 100%;
      aspect-ratio: 128/103;
    }
  }
</style>

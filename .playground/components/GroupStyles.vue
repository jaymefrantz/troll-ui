<template lang="pug">
  div.container
    span.default-label {{label}}
    ul.styles-list
      li.small-column
        <ColorDropdown v-model="color" label="Color" :compare="backgroundHex"/>
      li.small-column
        <ColorDropdown v-model="border" label="Border"/>
      li.small-column
        <ColorDropdown v-model="background" label="Background" :includeTransparent="true"/>
      li.border-width-column
        <Range v-model="borderWidth" label="Border Width" v-bind="rangeProps" :max="4"/>
      li.border-radius-column
        <Range v-model="borderRadius" label="Border Radius" v-bind="rangeProps" :max="15"/>
</template>

<script setup lang="ts">
  const color = defineModel("color")
  const background = defineModel("background")
  const border = defineModel("border")
  const borderWidth = defineModel("borderWidth")
  const borderRadius = defineModel("borderRadius")

  const colors = getColorOptions()

  const rangeProps = {
    min: 0,
    step: 1,
  }

  const props = defineProps<{
    label: string
    siteBackground: string
  }>()

  const backgroundHex = computed(() =>
    background.value !== "--transparent" ? colors[background.value] : colors[props.siteBackground]
  )
</script>

<style lang="scss" scoped>
  .border-width-column {
    grid-column: span 2;
  }

  .border-radius-column {
    grid-column: span 4;
  }
</style>

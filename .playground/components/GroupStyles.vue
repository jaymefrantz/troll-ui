<template lang="pug">
  div.container
    span.default-label {{label}}
    ul.group-styles
      li
        <ColorDropdown v-model="color" label="Color"/>
      li
        <ColorDropdown v-model="background" label="Background" :includeTransparent="true"/>
      li
        <ColorDropdown v-model="border" label="Border"/>
        li
          <Range v-model="borderWidth" label="Border Width" v-bind="rangeProps"/>
        li
          <Range v-model="borderRadius" label="Border Radius" v-bind="rangeProps"/>
</template>

<script setup lang="ts">
  const color = defineModel("color")
  const background = defineModel("background")
  const border = defineModel("border")
  const borderWidth = defineModel("borderWidth")
  const borderRadius = defineModel("borderRadius")

  const rangeProps = {
    min: "0",
    max: "6",
    step: "1",
  }

  defineProps<{
    label: string
  }>()
</script>

<style lang="scss" scoped></style>

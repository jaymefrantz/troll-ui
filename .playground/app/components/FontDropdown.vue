<template lang="pug">
  div.font-wrap
    div.container
      label(:for="`${id}Font`").default-label {{label}} font
      select(:id="`${id}Font`" v-model="font").native
        div.option-container
          option(v-for="font in fonts" :key="`${id}-${font}`" :value="font" :style="`font-family: ${font}; font-weight: ${weight}`") {{ font.replace('+', ' ') }}
    div.container
      label(:for="`${id}Weight`").default-label.small weight
      select(:id="`${id}Weight`" v-model="weight").native
        div.option-container
          option(v-for="weight in weights" :key="`${id}-${weight}`" :value="weight" :style="`font-weight: ${weight}; font-family: ${font}`") {{ weight }}
</template>

<script setup lang="ts">
  const font = defineModel("font")
  const weight = defineModel("weight")
  const weights = ref([100, 200, 300, 400, 500, 600, 700, 800])
  const fonts = Object.keys(useAppConfig().fonts).sort((a, b) => {
    return a.localeCompare(b)
  })

  defineProps<{
    label: string
    id: string
  }>()
</script>

<style scoped>
  .font-wrap {
    /* display: flex; */
    display: grid;
    grid-template-columns: 1fr 5rem;
  }

  /* [id$="Weight"] {
    width: 
  } */

  select {
    display: flex;
    justify-content: space-between;
  }

  .container {
    &:first-of-type {
      select {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
        padding-right: 0.25rem;
      }
    }

    &:last-of-type {
      select {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
        padding-left: 0.25rem;
      }
    }
  }

  select {
    width: 100%;
  }
</style>

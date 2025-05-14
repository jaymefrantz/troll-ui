<template lang="pug">
  div.font-wrap
    div.container
      label(:for="`${id}Font`").default-label {{label}} font
      select(:id="`${id}Font`" v-model="font")
        div.option-wrapper
          option(v-for="font in fonts" :key="`${id}-${font}`" :value="font" :style="`font-family: ${font}; font-weight: ${weight}`") {{ font.replace('+', ' ') }}
    div.container
      label(:for="id").default-label.small weight
      select(:id="id" v-model="weight")
        div.option-wrapper
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
    display: flex;
  }
  .container {
    &:first-of-type {
      select {
        background: red;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }
    }

    &:last-of-type {
      select {
        background: yellow;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
      }
    }
  }

  select {
    width: 100%;
  }
</style>

<template lang="pug">
  div.container
    label(:for="id").default-label {{label}}: {{value}}px
    input(type="range" :min="min" :max="max" :step="step" v-model="value" :id="id")
</template>

<script setup lang="ts">
  const value = defineModel()

  const props = withDefaults(
    defineProps<{
      label: string
      id: string
      unit?: string
      min?: number
      max?: number
      step?: number
    }>(),
    {
      unit: "px",
      min: 0,
      max: 6,
      step: 1,
    }
  )

  const id = computed(() => {
    return props?.id || `Range-${useId()}`
  })
</script>

<style lang="scss" scoped></style>

<template lang="pug">
  div.container
    label(:for="id").default-label {{label}}
    select(:id="id" v-model="value").native
      div.option-container
        option(v-for="(value, option) in options" :key="value" :value="value") {{ option }}
</template>

<script setup lang="ts">
  const value = defineModel()

  const props = defineProps<{
    options: Record<string, string>
    label: string
    id?: string
  }>()

  const id = computed(() => {
    return props?.id || `Select-${useId()}`
  })
</script>

<style lang="scss" scoped></style>

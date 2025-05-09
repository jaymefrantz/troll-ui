<template lang="pug">
  div.container
    label(:for="id").body-xs Icon
    select(:id="id" v-model="value")
      div.option-wrapper
        option(v-for="(value, option) in options" :key="value" :value="value") {{ option }}
</template>

<script setup lang="ts">
  const value = defineModel()

  const props = defineProps<{
    options: Record<string, string>
    label: string
    id: string
  }>()

  const id = computed(() => {
    return props?.id || `Select-${useId()}`
  })
</script>

<style lang="scss" scoped></style>

<template lang="pug">
  div(:class="family").icon-container
    <Icon v-if="name !== ''" :name="name" :size="size"/>
    <span v-if="label" class="icon-text" v-html="label"></span>
</template>

<script setup lang="ts">
  const props = defineProps({
    label: {
      type: String,
    },
    name: {
      type: String,
    },
    size: {
      type: String,
      default: "none",
    },
    color: {
      type: String,
      default: "currentColor",
    },
  })

  const family = computed(() => (props.name !== undefined ? props?.name.split(":")[0] : null))
</script>

<style lang="scss" scoped></style>

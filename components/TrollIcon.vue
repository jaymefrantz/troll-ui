<template lang="pug">
  div.icon-container
    <Icon :name="name" :size="size"/>
    <span v-if="label" class="icon-text" v-html="label"></span>
</template>

<script setup lang="ts">
  defineProps({
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
</script>

<style lang="scss" scoped></style>

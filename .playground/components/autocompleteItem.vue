<template lang="pug">
span {{ title }}
</template>

<script setup lang="ts">
defineProps<{
  title: string 
  id: number
  posterURL: string
  imdbId: string
}>()
</script>

<style lang="scss" scoped></style>
<template lang="pug">
  main#main
    nuxt-link(v-if="!isHome" to="/") Back to home
    <NuxtPage />
  </template>
  
  <script setup lang="ts">
    const isHome = computed(() => {
      return useRoute().path === "/"
    })

  </script>
  
  <style lang="scss" scoped></style>
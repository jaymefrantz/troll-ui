<template lang="pug">
  main#main
    div.extra-large-center-margin-wrap
      nuxt-link(v-if="!isHome" to="/").back-link Back to home
      div.page
        h1(v-if="!isHome") {{ title }}
        <NuxtPage />
  </template>
  
  <script setup lang="ts">
    const isHome = computed(() => {
      return useRoute().path === "/"
    })

    const title = computed(() => {
      return `${useRoute().path.split("/").at(-1).toLowerCase().split('-').map(function (word) {
          return (word.charAt(0).toUpperCase() + word.slice(1));
      }).join(' ')} Demo`
    })
  </script>
  
  <style lang="scss" scoped>
    #main {
      padding: clamp(2.5rem, 5vw, 5rem) clamp(1rem, 5vw, 2rem);
    }

    .back-link {}
    h1 {
      margin-bottom: 2rem;
    }

  </style>
<template lang="pug">
  header
    div.extra-large-center-margin-wrap
      <logo id="logo"/>
  main#main
    div.extra-large-center-margin-wrap
      <NuxtLayout :name="layout">
        <NuxtPage />
      </NuxtLayout>
</template>

<script setup lang="ts">
  import logo from "./assets/svg/troll-ui-logo.svg?component"
  const layout = computed(() => useRoute().path.startsWith("/dev") ? "dev" : "default")
  const isHome = computed(() => {
    return useRoute().path === "/"
  })
</script>

<style lang="scss" scoped>
  header {
    padding: 0 var(--side-padding);

    .extra-large-center-margin-wrap {
      padding: 1em 0;
      border-bottom: 1px solid var(--dark-800);
    }
  }

  #logo {
    height: 1.65rem;
  }

  #main {
    padding: clamp(2rem, 5vw, 3rem) var(--side-padding);
  }
</style>
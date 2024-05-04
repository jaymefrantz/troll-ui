<template lang="pug">
ul
  li(v-for="page in pages" :key="page.path")
    nuxt-link(:to="page.path") {{ page.name }}
</template>

<script setup lang="ts">
  const pages = useRouter().getRoutes().filter(({ path }) => path.startsWith("/dev")).map(({ path, name }) => ({ path, name: name.replace("dev-", "") }))
</script>

<style lang="scss" scoped></style>
<template lang="pug">
h1 Troll UI Components
ul.pages-list
  li(v-for="name, link in pages")
    <navLink :to="link" :label="name" direction="right"/>
    //- nuxt-link(:to="link") {{ name }}
</template>

<script setup lang="ts">
  useHead({
    title: "Troll UI",
  })
  const pages = useDevPages()
</script>

<style lang="scss" scoped>
  .pages-list {
    max-width: 30rem;
    //margin-top: 2rem;

    & > li {
      margin-top: 1.4em;
    }
  }

  :deep(.nav-link) {
    position: relative;
    padding-right: 4em;
  }

  :deep(.icon-container) {
    position: absolute;
    right: 1em;
    top: 50%;
    translate: 0 -50%;
  }

  // a {
  //   text-decoration: none;
  //   color:
  // }
</style>

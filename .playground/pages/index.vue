<template lang="pug">
  section
    h2.heading-xl Typography
    p(v-for="size in headingSizes" :class="`heading-${size}`") Heading {{ size }}
    p(v-for="size in bodySizes" :class="`body-${size}`") Body {{ size }}
  section
    h2.heading-xl Colors
  section
    h2.heading-xl Icons
  section
    h2 Troll UI Components
    ul.pages-list
      li(v-for="name, link in pages")
        <navLink :to="link" :label="name" direction="right"/>
        //- nuxt-link(:to="link") {{ name }}
</template>

<script setup lang="ts">
  const icons = useState("icons")

  useHead({
    title: "Troll UI",
  })
  const pages = useDevPages()
  const headingSizes = ["xxl", "xl", "lg", "md", "sm", "xs"]
  const bodySizes = ["lg", "md", "sm", "xs"]
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

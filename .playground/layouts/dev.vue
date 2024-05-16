<template lang="pug">
  ul.breadcrumbs
    li
      nuxt-link(to="/") Home
      span(aria-hidden="true").separator /
    li.text {{ title }}
  h1 {{ title }} Demo
  <slot/>
  ul.nav-link-list
    li(v-if="links.previous !== null").previous
      navLink(:to="links.previous.link" :label="links.previous.name" direction="left")
    li(v-if="links.next !== null").next
      navLink(:to="links.next.link" :label="links.next.name" direction="right")
</template>

<script setup lang="ts">
  const pages = useDevPages()
  const title = computed(() => pages[useRoute().path])
  const links = computed(() => {
    const paths = Object.keys(pages)
    const index = paths.indexOf(useRoute().path)

    return {
      previous: formatObj(paths[index - 1]),
      next: formatObj(paths[index + 1]),
    }
  })

  function formatObj(link: string | undefined) {
    if(link === undefined) return null
    return {
      name: pages[link],
      link,
    }
  }

  useHead({
    title: computed(() => `${title.value} Demo / Troll UI`),
  })
</script>

<style lang="scss" scoped>
  .breadcrumbs {
    display: flex;
    align-items: center;
    --focus-color: var(--dark-200);
    --focus-offset: 0.2rem;

    a {
      color: var(--dark-400);
      text-decoration: none;
      transition: color $medium;

      &:hover {
        color: var(--near-white);
      }
    }
  }

  .text {
    font-weight: 700;
  }

  .separator {
    margin: 0 0.65em;
  }

  h1 {
    margin-top: 0.65em;
  }

  .nav-link-list {
    padding: 0;
    margin: 4em 0 2em;

    @include viewport($medium-viewport up) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.2em;

      & > li {
        width: 50%;
      }
    }

    & > li {
      display: flex;
      align-items: center;
      max-width: 30rem;
      width: 50%;

      &.previous {
        margin-right: auto;
        text-align: left;
      }

      &.next {
        margin-left: auto;
        text-align: right;
      }
    }
  }

  :deep(.nav-link .text) {
    margin-top: 1rem;
  }
</style>
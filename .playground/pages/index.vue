<template lang="pug">
  //- section
    h2.heading-xl Typography
    p(v-for="size in headingSizes" :class="`heading-${size}`") Heading {{ size }}
    p(v-for="size in bodySizes" :class="`body-${size}`") Body {{ size }}
  section
    h2.heading-xl Colors
    ul.colors-list
      li(v-for="(hex, name, index) in colors" :key="name")
        button(type="button").color(:style="`background-color: var(${name})`" @click="copy(hex)")
          Icon(:name="copyIcon" size="none" :style="`color: var(--${name.replace('--', '').split('-')[0]}-${(index % 10) < 4 ? 900 : 50})`")
          span.sr-only Copy color hex
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
  const source = ref("")
  const { text, copy, copied, isSupported } = useClipboard({ source })
  // console.log(icons.value)

  const colors = Object.assign(
    {},
    ...Object.values(groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors)))
  )

  const copyIcon = computed(() => icons.value.copy ?? "qlementine-icons:ungroup-16")

  useHead({
    title: "Troll UI",
  })

  const pages = useDevPages()
  const headingSizes = ["xxl", "xl", "lg", "md", "sm", "xs"]
  const bodySizes = ["lg", "md", "sm", "xs"]
</script>

<style lang="scss" scoped>
  .colors-list {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0.25em;
    //grid-template-rows: repeat(auto-fill, 3rem);

    &:has(.color:hover) .color:not(:hover),
    &:has(.color:focus-visible) .color:not(:focus-visible) {
      opacity: 0.5;
      scale: 0.875;
    }
  }

  .color {
    aspect-ratio: 4 / 3;
    width: 100%;
    border: 0;
    display: block;
    transition: opacity 0.25s, scale 0.25s;

    svg {
      width: 70%;
      max-width: 3rem;
      opacity: 0;
      transition: opacity 0.25s;
    }

    &:hover,
    &:focus-visible {
      opacity: 1;
      scale: 1.125;

      svg {
        opacity: 1;
      }
    }
  }

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

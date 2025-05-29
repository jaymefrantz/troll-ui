<template lang="pug">
  //- pre {{JSON.stringify(sortedIcons, null, 2)}}
  section.components
    h2 Troll UI Components
    ul.pages-list
      li(v-for="name, link in pages")
        <navLink :to="link" :label="name" direction="right"/>
        //- nuxt-link(:to="link") {{ name }}
  section.typography
    h2.heading-xl Typography
    p(v-for="size in headingSizes" :class="`heading-${size}`") Heading {{ size }}
    p(v-for="size in bodySizes" :class="`body-${size}`") Body {{ size }}
  section
    h2.heading-xl Icons
    h3.heading-sm.icon-set-name {{iconSet}}
      a(:href="iconLink.link" target="_blank" rel="noopener noreferrer")
        Icon(:name="iconLink.icon" size="none")
        span.sr-only Open icon set
    ul.icons-list
      li(v-for="(icon, name) in sortedIcons" :key="name")
        button(type="button" @click="copy(icon)")
          Icon(:name="icon" size="none").icon
          span.icon-name {{icon}}
          Icon(:name="copyIcon" size="none").copy-icon
          span.sr-only Copy {{name.replace("-", " ")}} icon
  section
    h2.heading-xl Colors
    ul.colors-list
      li(v-for="(hex, name, index) in colors" :key="name")
        button(type="button").color(:style="`background-color: var(${name})`" @click="copy(hex)")
          Icon(:name="copyIcon" size="none" :style="`color: var(--${name.replace('--', '').split('-')[0]}-${(index % 10) < 4 ? 900 : 50})`").copy-icon
          span.sr-only Copy color hex
</template>

<script setup lang="ts">
  const icons = useState("icons")
  const iconSet = useState("iconSet")
  const source = ref("")
  const { text, copy, copied, isSupported } = useClipboard({ source })

  const colors = Object.assign(
    {},
    ...Object.values(groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors)))
  )

  const copyIcon = computed(() => icons.value.copy ?? "qlementine-icons:ungroup-16")
  const iconLink = computed(() => {
    return {
      link: useAppConfig().icons[iconSet.value ?? "Qlementine Icons"].link,
      icon: icons.value.open ?? "heroicons:arrow-top-right-on-square-solid",
    }
  })

  const sortedIcons = computed(() => {
    return Object.keys(icons.value)
      .filter(key => !key.includes(":"))
      .sort()
      .reduce((obj, key) => ({ ...obj, [key]: icons.value[key] }), [])
  })

  useHead({
    title: "Troll UI",
  })

  const pages = useDevPages()
  const headingSizes = ["xxl", "xl", "lg", "md", "sm", "xs"]
  const bodySizes = ["lg", "md", "sm", "xs"]
</script>

<style lang="scss" scoped>
  section:not(.components) {
    margin-top: 4em;

    &:has(button:hover) button:not(:hover),
    &:has(button:focus-visible) button:not(:focus-visible) {
      opacity: 0.5;
      scale: 0.75;
    }

    button {
      transition: opacity 0.25s, scale 0.25s;
      &:hover,
      &:focus-visible {
        opacity: 1;
        scale: 1.125;

        svg.copy-icon {
          opacity: 1;
        }
      }
    }
  }

  svg.copy-icon {
    opacity: 0;
    transition: opacity 0.25s;
  }

  .icon-set-name {
    display: flex;
    align-items: flex-start;
    margin-top: 1em;

    a {
      display: block;
      width: 0.65em;
      transform: translateY(-0.25em);
      margin-left: 0.15em;
      color: currentColor;
    }
  }

  .typography p {
    color: var(--site-secondary-color);
    margin: 0.5em 0;
  }

  .colors-list {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0.25em;
    //grid-template-rows: repeat(auto-fill, 3rem);

    // &:has(.color:hover) .color:not(:hover),
    // &:has(.color:focus-visible) .color:not(:focus-visible) {
    //   opacity: 0.5;
    //   scale: 0.875;
    // }
  }

  .color {
    aspect-ratio: 4 / 3;
    width: 100%;
    border: 0;
    display: block;

    svg {
      width: 70%;
      max-width: 3rem;
      // opacity: 0;
      // transition: opacity 0.25s;
    }

    // &:hover,
    // &:focus-visible {
    //   opacity: 1;
    //   scale: 1.125;

    //   svg {
    //     opacity: 1;
    //   }
    // }
  }

  .icons-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
    gap: 0.25em;
    margin-top: 1rem;

    button {
      width: 100%;
      background: transparent;
      border: 0;
      position: relative;

      &:hover,
      &:focus-visible {
        svg:not(.copy-icon) {
          opacity: 0.25;
        }
      }
    }

    .copy-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      width: 3rem;
    }
  }

  .icon-name {
    font-size: 0.75rem;
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    bottom: 0;
    opacity: 0;
  }

  .icon,
  .icon-set-name {
    color: var(--site-secondary-color);
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

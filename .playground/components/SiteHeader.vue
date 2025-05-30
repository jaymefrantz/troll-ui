<template lang="pug">
  header
    div.extra-large-center-margin-wrap
      <logo id="logo"/>
      <Styles/>
</template>

<script setup lang="ts">
  import logo from "./assets/svg/troll-ui-logo.svg?component"
  import data from "./assets/svg/troll-ui-logo.svg?raw"
  const color = useState("color")
  const svgString = svgToBackground()

  const favicon = computed(() => {
    return (
      svgString?.replace(`var(--site-color)`, `${color.value?.replace("#", "%23") ?? ""}`) ?? ""
    )
  })

  function svgToBackground(): string {
    const svgStart = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">`
    const svgMatch = data.match(/<svg[^>]*>/)
    const svgClose = "</svg>"
    const faviconMatch = data.match(/<g[^>]*class="[^"]*favicon[^"]*"[^>]*>[\s\S]*?<\/g>/)
    const full = `${svgStart}\n  ${faviconMatch[0]}\n${svgClose}`

    const minified = full
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .replace(/\t/g, "")
      .replace(/\s{2,}/g, " ")

    const encoded = encodeURIComponent(minified).replace(/'/g, "%27").replace(/"/g, "%22")
    return `data:image/svg+xml;charset=UTF-8,${encoded}`
  }

  useHead({
    link: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: () => favicon.value,
      },
    ],
  })
</script>

<style scoped lang="scss">
  .extra-large-center-margin-wrap {
    display: flex;
    justify-content: space-between;
  }

  :global(body:has(.dark-theme) #logo) {
    color: var(--site-color-50);
  }

  :global(body:has(.light-theme) #logo) {
    color: var(--site-color-900);
  }

  header {
    padding: 0 var(--side-padding);

    .extra-large-center-margin-wrap {
      padding: 1em 0;
    }
  }

  #logo {
    width: clamp(8.5rem, 20vw, 11rem);
  }
</style>

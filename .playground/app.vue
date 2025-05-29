<template lang="pug">
  <SiteHeader />
  main#main
    div.extra-large-center-margin-wrap
      <NuxtLayout :name="layout">
        <NuxtPage />
      </NuxtLayout>
</template>

<script setup lang="ts">
  const { styles } = useAppConfig()

  const layout = computed(() => (!isHome.value ? "dev" : "default"))
  const isHome = computed(() => {
    return useRoute().path === "/"
  })

  useHead({
    style: [
      {
        innerHTML: `:root {${jsonToCSSVars(useAppConfig().root).join("\n")} ${jsonToCSSVars(
          useAppConfig().colors
        ).join("\n")}`,
      },
    ],
  })
</script>

<style lang="scss">
  // @import "@/assets/scss/design/colors.scss"; //this shouldn't happen, but vite additionalData might not be working?
  :root {
    // --textbox-border: 2px solid var(--site-color-200);
    --textbox-font-size: 0.875em;
    --textbox-font: var(--body-font);
    // --textbox-border-radius: var(--border-radius);
    --textbox-padding-y: 0.5rem;
    // --textbox-padding-x: 1.2rem;
    --textbox-weight: var(--body-weight);

    --dropdown-background: var(--textbox-background);
    --dropdown-border: var(--textbox-border);
    --dropdown-color: var(--textbox-color);
    --trigger-font: var(--body-font);
    --trigger-font-size: 0.875em;
    --dropdown-border-radius: var(--textbox-border-radius);
    --trigger-padding: var(--textbox-padding-y) var(--textbox-padding-x);

    --autocomplete-background: transparent;
    --autocomplete-border: var(--textbox-border);
    --autocomplete-border-radius: var(--textbox-border-radius);
    --autocomplete-font: var(--body-font);
    --autocomplete-font-size: var(--textbox-font-size);
    --autocomplete-font-weight: var(--body-weight);
    --autocomplete-padding: var(--textbox-padding-y) var(--textbox-padding-x);
    --autocomplete-color: var(--textbox-color);
    --autocomplete-wrap-padding: 0 0 0 1rem;

    --side-padding: clamp(1rem, 4.2vw, 2rem);
  }
  // :root {
  //   --primary: #{$primary};
  //   --near-black: #{$near-black};
  //   --near-white: #{$near-white};
  //
  //   --font-max: 1.2rem;
  //   --font-min: 1rem;
  //   --font-scaler: 2.4vw;
  //   --font-family: "Noto Sans", sans-serif;
  //   --font-weight: 300;
  //   --focus-offset: 5px;
  //   --focus-outline-color: var(--primary);
  //   --focus-color: var(--primary);

  //   //need font family
  //   //focus things
  //   @each $weight, $color in $grey {
  //     --dark-#{ $weight }: #{$color};
  //   }

  //   --site-color: #{$near-white};
  //   --site-background: #18181b;
  //   --border: 1px solid var(--dark-800);
  //   --border-radius: 0.5rem;

  //   --dropdown-border: var(--border);
  //   --dropdown-background: var(--site-background);
  //   --dropdown-color: var(--dark-200);
  //   --dropdown-border-radius: 0.2rem;
  //   --trigger-font-weight: 500;
  //   --trigger-hover-color: var(--dark-200);
  //   --scrollbar-color: var(--dark-600);
  //   --option-color: var(--dark-200);
  //   --option-selected-background: var(--primary);
  //   --option-hover-background: var(--dark-800);
  //   --option-size: 0.9em;
  //   --dropdown-gradient: linear-gradient(
  //     -180deg,
  //     rgba(255, 255, 255, 0) 0%,
  //     rgba(24, 24, 27, 1) 100%
  //   );
  //   --autocomplete-background: var(--site-background);
  //   --autocomplete-border: var(--border);
  //   --autocomplete-border-radius: 0.2rem;
  //   --autocomplete-color: var(--dark-200);
  // }
</style>
<style>
  #main {
    padding: clamp(2rem, 5vw, 3rem) var(--side-padding);
  }

  h1 {
    font-size: 3em;
    font-weight: 500;
    margin-bottom: 0.875em;
  }

  .default-label {
    font-size: var(--label-size, 0.825em);
    font-family: var(--body-font);
    margin-bottom: 0.5em;
    display: block;
    font-weight: var(--label-weight, var(--body-weight));
  }

  .subtitle {
    font-size: 1.2em;
    color: var(--primary);
    font-weight: 400;
    margin-bottom: 0.25em;
  }

  .heading-xxl {
    font-size: var(--heading-size-xxl);
    line-height: var(--line-height-sm);
    font-family: var(--heading-font);
    font-weight: var(--heading-weight);
  }

  h1,
  .heading-xl {
    font-size: var(--heading-size-xl);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    font-weight: var(--heading-weight);
  }

  h2,
  .heading-lg {
    font-size: var(--heading-size-lg);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    font-weight: var(--heading-weight);
  }

  h3,
  .heading-md {
    font-size: var(--heading-size-md);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    font-weight: var(--heading-weight);
  }

  h4,
  .heading-sm {
    font-size: var(--heading-size-sm);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    font-weight: 600;
  }

  h5,
  .heading-xs {
    font-size: var(--heading-size-xs);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    font-weight: 600;
  }

  h6,
  .heading-xxs {
    font-size: var(--heading-size-xxs);
    line-height: var(--line-height-md);
    font-family: var(--heading-font);
    text-transform: uppercase;
    font-weight: 400;
  }

  .body-lg {
    font-size: var(--body-size-lg);
    line-height: var(--line-height-lg);
    font-weight: var(--body-weight);
    font-family: var(--body-font);
  }

  .body-md {
    font-size: var(--body-size-md);
    line-height: var(--line-height-lg);
    font-weight: var(--body-weight);
    font-family: var(--body-font);
  }

  .body-sm {
    font-size: var(--body-size-sm);
    line-height: var(--line-height-lg);
    font-weight: var(--body-weight);
    font-family: var(--body-font);
  }

  .body-xs {
    font-size: var(--body-size-xs);
    line-height: var(--line-height-lg);
    font-weight: var(--body-weight);
    font-family: var(--body-font);
  }

  .body-xxs {
    font-size: var(--body-size-xxs);
    line-height: var(--line-height-lg);
    font-weight: var(--body-weight);
    font-family: var(--body-font);
  }
</style>

<template lang="pug">
  div.container
    label(:for="id").default-label {{label}}
    select(:id="id" v-model="value")
      button(type="button")
        <selectedcontent :style="`--color: var(${value})`">{{value}}</selectedcontent>
      div.option-container
        div(v-for="(colorOptions, name) in colors" role="group")
          label {{name}}
          option(v-for="(hex, cssVar, index) in colorOptions" :key="`${id}-${cssVar}`" :style="`--color: ${hex}`" :value="cssVar")
            span.sr-only {{cssVar.replace("--", "").split("-").join(" ")}}
</template>

<script setup lang="ts">
  const colors = groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors))
  const value = defineModel()

  const props = defineProps<{
    label: string
    id: string
    options?: Record<string, string>
  }>()

  const colorOptions = computed(() => {
    return props?.options || colors
  })

  const id = computed(() => {
    return props?.id || `Select-${useId()}`
  })

  function groupCSSVarsByPrefix(cssVars) {
    return cssVars.reduce((groups, str) => {
      const [rawKey, rawValue] = str.split(":")
      const key = rawKey.trim().replace(/^--/, "") // remove leading --
      const value = rawValue.trim().replace(";", "")

      const [prefix] = key.split("-") // get the first word before dash

      if (!groups[prefix]) {
        groups[prefix] = {}
      }

      groups[prefix][`--${key}`] = value // keep the original format in key

      return groups
    }, {})
  }
</script>

<style scoped>
  selectedcontent {
    &:before {
      content: "";
      display: block;
      width: 1.25rem;
      aspect-ratio: 1;
      background-color: var(--color);
      border-radius: 4px;
      border: 1px solid var(--grey-200);
      //box-shadow: inset 0 0 0 1px var(--grey-100), 0 0 0 2px var(--grey-200);
    }
  }

  .option-container {
    /* width: 200px; */
    padding: 1rem 0;
    height: 300px;
    background: white;
    overflow-y: scroll;
  }

  [role="group"] {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    overflow: hidden;
    /* gap: 0.05rem; */
    padding: 0 1rem;

    & + & {
      padding-top: 0.5rem;
    }

    label {
      grid-column: span 10;
      font-family: var(--body-font);
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    &:has(option:hover) option:not(:has(:hover)),
    &:has(option:focus-visible) option:not(:has(:focus-visible)) {
      scale: 0.875;
      opacity: 0.5;
    }
  }

  option {
    aspect-ratio: 1;
    position: relative;
    transition: scale 0.325s, opacity 0.25s;
    padding: 0.25rem;

    &::checkmark {
      display: none;
    }

    &:hover,
    &:focus-visible {
      scale: 1.2 !important;
      opacity: 1 !important;
      background: none;
      --border: var(--color);
    }

    &:before {
      content: "";
      width: 1.65rem;
      /* width: 100%; */
      /* height: 100%; */
      /* height: 1rem; */
      display: block;
      aspect-ratio: 1;
      background-color: var(--color);
      box-shadow: inset 0 0 0 1px white, 0 0 0 1px var(--border, var(--grey-200));
      border-radius: 100%;
      /* border: 1px solid var(--grey-50); */
    }
  }
</style>

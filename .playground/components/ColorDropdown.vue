<template lang="pug">
  div.container
    label(:for="id").body-xxs {{label}}
    select(:id="id" v-model="value")
      button(type="button")
        <selectedcontent :style="`--color: var(${value})`">{{value}}</selectedcontent>
      div.option-container
        option(v-for="(hex, cssVar, index) in colorOptions" :key="`${id}-${cssVar}`" :style="`--color: ${hex}`" :value="cssVar")
          span.sr-only {{cssVar.replace("--", "").split("-").join(" ")}}
</template>

<script setup lang="ts">
  const colors = groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors))
  const colorOptions = Object.values(colors).reduce((obj, group) => ({ ...obj, ...group }), {})
  const value = defineModel()

  const props = defineProps<{
    label: string
    id: string
  }>()

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

<style>
  select {
    &,
    &::picker(select) {
      appearance: base-select;
    }

    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;

    &::picker(select) {
      background: var(--site-background);
      border: 0;
      transition: display allow-discrete 1s, opacity 0.25s, overlay 1s allow-discrete;
    }

    &:not(:open)::picker(select) {
      opacity: 0;
    }

    &:open::picker(select) {
      opacity: 1;

      @starting-style {
        opacity: 0;
      }
    }

    &::picker-icon {
      /* content: v-bind(dropdownLink); */
    }

    &:open {
      ::picker-icon {
        transform: rotate(180deg);
      }

      &:has(option:hover) option:not(:has(:hover)),
      &:has(option:focus-visible) option:not(:has(:focus-visible)) {
        //scale: 0.975;
        opacity: 0.5;
      }
    }

    & option {
      padding: 0;
      aspect-ratio: 1;
      position: relative;
      transition: scale 0.325s, opacity 0.25s;

      &::checkmark {
        /* // content: v-bind(checkLink); */
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        color: white;
      }

      /* &:focus-visible {
        border: 1px solid red;
      } */

      .option-container > &:hover,
      .option-container > &:focus-visible {
        scale: 1.15 !important;
        opacity: 1 !important;
      }

      &:before {
        content: "";
        display: block;
        /* width: 1rem; */
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        background-color: var(--color);
        /* border-radius: 100%; */
        /* border: 1px solid var(--grey-50); */
      }
    }
  }

  .color-group-list {
    display: flex;
    gap: 0.25rem;
  }

  selectedcontent {
    white-space: nowrap;
    text-overflow: ellipsis;

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
    display: grid;
    grid-template-columns: repeat(10, 1fr);
  }
</style>

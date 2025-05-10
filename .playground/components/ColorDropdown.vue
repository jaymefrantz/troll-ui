<template lang="pug">
  div.container
    label(:for="id").body-xxs {{label}}
    //- pre {{JSON.stringify(colors, null, 2)}}
    //- div(v-for="([color, group]) in Object.entries(colors)" role="group")
    //-   pre(v-for="(hex, cssVar) in group") {{JSON.stringify(cssVar, null, 2)}}
    select(:id="id" v-model="value")
      button(type="button" :style="`--color: var(${value})`")
        <selectedcontent>{{value}}</selectedcontent>
      div.scrollable
        option(v-for="(hex, cssVar, index) in colorOptions" :key="`${id}-${value}`" :style="`--color: ${hex}`" :value="cssVar")
          span.sr-only {{cssVar.replace("--", "").split("-").join(" ")}}
        //div
          //- label {{color}}
        //ul(v-for="([color,group]) in Object.entries(colors)" role="group").color-group-list
          li(v-for="(hex, cssVar, index) in group" :key="`${id}-${value}`" :style="`--color: ${hex}`")
            option(:value="cssVar")
              span(v-html="`${color} ${index === 0 ? '50' : index * 100}`").sr-only
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

<style scoped>
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
    }

    option {
      /* background: var(--site-background);
      font-size: 0.875em;
      color: var(--dropdown-color); */
      /* gap: 0.2em; */
      padding: 0;

      &::checkmark {
        /* // content: v-bind(checkLink); */
        display: none;
      }

      &:checked {
        background: red;
      }

      &:before {
        content: "";
        display: block;
        width: 1rem;
        aspect-ratio: 1;
        background-color: var(--color);
        border-radius: 100%;
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
      width: 1.5rem;
      aspect-ratio: 1;
      background-color: var(--color);
      border-radius: 100%;
      box-shadow: inset 0 0 0 1px var(--grey-100), 0 0 0 1px var(--grey-200);
    }
  }
</style>

<template lang="pug">
  //- pre {{JSON.stringify(invalidContrast, null, 2)}}
  div.container
    select(:id="id" v-model="value").color
      button(type="button")
        <selectedcontent :style="`--color: var(${value})`" :class="invalidContrast.includes(colorOptions[value]) ? 'invalid' : ''">{{value}}</selectedcontent>
        span.label {{label}}
      div(ref="container").option-container
        option(v-if="includeTransparent" :key="`${id}-transparent`" :value="'--transparent'" :style="`--color: var(--transparent)`").transparent 
          span Transparent
        option(v-for="(hex, cssVar, index) in colorOptions" :key="`${id}-${cssVar}`" :disabled="invalidContrast.includes(hex)" :style="`--color: ${hex}`" :value="cssVar")
          span.sr-only {{cssVar.replace("--", "").split("-").join(" ")}}
    //-label(:for="id") {{label}} //this doesn't trigger the select for some reason
</template>

<script setup lang="ts">
  const colors = groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors))
  const value = defineModel()

  const props = withDefaults(
    defineProps<{
      label: string
      id?: string
      options?: Record<string, string>
      compare?: string
      includeTransparent?: boolean
    }>(),
    {
      includeTransparent: false,
    }
  )

  const colorOptions = computed(() => {
    return (
      props?.options || Object.values(colors).reduce((obj, group) => ({ ...obj, ...group }), {})
    )
  })

  const compareRef = toRef(props, "compare")

  const invalidContrast = useContrastChecker(Object.values(colorOptions.value), compareRef)

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
  [disabled],
  .invalid {
    &:before {
      border: 1px solid red;
    }

    &:after {
      content: "X";
      color: red;
      /* 
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      */
      background-image: radial-gradient(red 1px, transparent 1px);
      background-size: 4px 4px;
      /* content: ""; */
      position: absolute;
      inset: 0;
    }
  }
  .label {
    font-size: 0.875rem;
    font-weight: 400;
    font-family: var(--body-font);
  }

  .container {
    display: inline-flex;
    --transparent: white
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='5' height='5' fill='%23ffffff'/%3E%3Crect x='5' y='5' width='5' height='5' fill='%23ffffff'/%3E%3Crect x='5' width='5' height='5' fill='%23ccc'/%3E%3Crect y='5' width='5' height='5' fill='%23ccc'/%3E%3C/svg%3E")
      repeat;
  }

  ::picker-icon {
    display: none;
  }

  select {
    align-items: center;
    gap: 0.375rem;
    /* padding: 0;
    border: 0; */

    &:open {
      &:has(option:hover) option:not(:has(:hover)),
      &:has(option:focus-visible) option:not(:has(:focus-visible)) {
        opacity: 0.5;

        &:before {
          scale: 0.975;
        }
      }
    }

    & option {
      padding: 0;
      aspect-ratio: 1;
      position: relative;
      transition: opacity 0.25s;
      background: transparent;
      display: flex;
      align-items: center;
      text-align: center;

      &[disabled] {
        cursor: not-allowed;
      }

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

      .option-container > &:not([disabled]):hover,
      .option-container > &:focus-visible {
        opacity: 1 !important;
        &:before {
          scale: 1.15 !important;
        }
      }

      &:before {
        content: "";
        display: block;
        /* width: 1rem; */
        width: 1.5rem;
        /* height: 100%; */
        aspect-ratio: 1;
        transition: scale 0.325s;
        background: var(--color);
      }

      &.transparent {
        grid-column: span 10;
        width: 100%;
        height: 1.5rem;
        padding-bottom: 0.5rem;

        span {
          font-size: 0.875rem;
        }
      }
    }
  }

  selectedcontent {
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;

    span {
      border: 0;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      white-space: nowrap;
    }

    &:before {
      content: "";
      display: block;
      width: 0.875rem;
      aspect-ratio: 1;
      background: var(--color);
      border-radius: 100%;
      border: 1px solid var(--grey-200);
      //box-shadow: inset 0 0 0 1px var(--grey-100), 0 0 0 2px var(--grey-200);
    }
  }

  .option-container {
    display: grid;
    grid-template-columns: repeat(10, 1.5rem);
    overflow: hidden;
    background: white;
    gap: 0 0.25rem;
    grid-template-rows: repeat(auto-fill, 1.5rem);
  }
</style>

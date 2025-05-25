<template lang="pug">
  //- pre {{JSON.stringify(invalidContrast, null, 2)}}
  div.container
    select(:id="id" v-model="value" :class="invalidContrast.includes(colorOptions[value]) ? 'invalid' : ''").color
      button(type="button")
        <selectedcontent :style="`--color: var(${value})`">{{value}}</selectedcontent>
        span.label {{label}}
      div(ref="container").option-container
        option(v-if="includeTransparent" :key="`${id}-transparent`" :value="'--transparent'" :style="`--color: var(--transparent)`").transparent 
          Icon(v-if="value === '--transparent'" :name="check").check-icon
          span Transparent
        option(v-for="(hex, cssVar, index) in colorOptions" :key="`${id}-${cssVar}`" :disabled="invalidContrast.includes(hex)" :style="`--color: ${hex}`" :value="cssVar")
          Icon(v-if="value === cssVar" :name="check" size="1.5rem" :style="`color: var(--${cssVar.replace('--', '').split('-')[0]}-${(index % 10) < 4 ? 900 : 50})`").check-icon
          span.sr-only {{cssVar.replace("--", "").split("-").join(" ")}}
    //-label(:for="id") {{label}} //this doesn't trigger the select for some reason
</template>

<script setup lang="ts">
  const colors = groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors))
  const value = defineModel()
  const icons = useState("icons")

  const check = computed(() => icons.value.check)

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
  :global(.small-column:has(select:open)) {
    grid-column: span calc(var(--sm-column) * 2);
  }
  [disabled],
  .invalid {
    &:before {
      border: 1px solid red;
    }
  }

  .invalid selectedcontent,
  [disabled] {
    color: red;

    &:after {
      content: "";
      background-image: radial-gradient(red 1px, transparent 1px);
      background-size: 4px 4px;
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

    &.invalid {
      border-color: red;
    }

    &:has(option:hover) option:not(.transparent):not(:has(:hover)),
    &:has(option:hover) option.transparent:not(:has(:hover)):before,
    &:has(option:focus-visible) option:not(.transparent):not(:has(:focus-visible)),
    &:has(option:focus-visible) option.transparent:not(:has(:focus-visible)):before {
      opacity: 0.5;
      scale: 0.875;
    }

    & option {
      padding: 0;
      /* aspect-ratio: 1; */
      position: relative;
      transition: opacity 0.25s, scale 0.25s;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1.5rem;
      font-size: 1rem;
      background: var(--color);

      &[disabled] {
        cursor: not-allowed;
        border: 1px solid currentColor;
      }

      &::checkmark {
        display: none;
      }

      .check-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
      }

      /* &:focus-visible {
        border: 1px solid red;
      } */

      .option-container > &:not(.transparent):not([disabled]):hover,
      .option-container > &:not(.transparent):focus-visible {
        opacity: 1 !important;
        scale: 1.15 !important;
      }

      &[disabled]:after {
        /* content: "X"; */
        /* width: 1.5rem;
        height: 1.5rem;
         */
      }

      &.transparent {
        grid-column: span 10;
        background: transparent;
        justify-content: flex-start;

        &:before {
          content: "";
          display: block;
          width: 1.5rem;
          aspect-ratio: 1;
          background: var(--transparent);
          transition: opacity 0.25s, scale 0.25s;
        }

        .option-container > &:hover,
        .option-container > &:focus-visible {
          scale: none;
          &:before {
            scale: 1.15;
          }
        }

        span {
          font-size: 0.875rem;
          //padding-left: 2rem;
        }
      }
    }
  }

  selectedcontent {
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;

    .check-icon {
      display: none;
    }

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
    }

    .invalid &:before {
      border: 1px solid currentColor;
    }

    &:after {
      border-radius: 100%;
    }
  }

  .option-container {
    display: grid;
    grid-template-columns: repeat(10, 1.5rem);
    overflow: hidden;
    gap: 0.25rem;
    grid-template-rows: repeat(auto-fill, 1.5rem);
    padding: calc(0.5rem + var(--textbox-padding-x));
    justify-content: center;
  }
</style>

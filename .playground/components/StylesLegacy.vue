<template lang="pug">
  div.styles
    div.extra-large-center-margin-wrap
      button(type="button") 
        span.button-text Change styles
      div.expanding-outer
        div.expanding-inner
          ul.styles-list
            li
              <NativeDropdown v-model="storage.icon" label="Icons" :options="convertToObject(Object.keys(allIcons))" />
            li
              <NativeDropdown v-model="storage.background" label="Background" :options="convertToObject(backgrounds)" />
            li
              div.container
                label(for="color").body-xs Color
                select(id="color" v-model="storage.color")
                  button(type="button")
                    <selectedcontent>{{storage.color}}</selectedcontent>
                  div.scrollable
                    div(v-for="([color, group]) in colorOptions" role="group")
                      label {{color}}
                      option(v-for="(key, value) in group" :key="value" :value="value" :style="`--color: ${key}`") {{ value }}
            li
              div.container
                label(for="headingFont").body-xs Heading font
                select(id="headingFont" v-model="storage.headingFont")
                  div.option-wrapper
                    option(v-for="font in fonts" :key="font" :value="font") {{ font }}
                select(id="headingWeight" v-model="storage.headingWeight").weight
                  div.option-wrapper
                    option(v-for="weight in weights" :key="`heading-${weight}`" :value="weight") {{ weight }}
            li
              div.container
                label(for="bodyFont").body-xs Body font
                select(id="bodyFont" v-model="storage.bodyFont")
                  div.option-wrapper
                    option(v-for="font in fonts" :key="font" :value="font") {{ font }}
                select(id="bodyWeight" v-model="storage.bodyWeight").weight
                  div.option-wrapper
                    option(v-for="weight in weights" :key="`body-${weight}`" :value="weight") {{ weight }}
            li
              div.container
                label(for="button") Button styles
                select(id="button" v-model="storage.buttonStyle.style")
                  div.option-wrapper
                    option(v-for="style in ['filled', 'outlined']" :key="style" :value="style") {{ style }}
                select(v-model="storage.buttonStyle.color")#buttonColor.weight
                  div.option-wrapper
                    option(v-for="color in ['50', ...weights, '900']" :key="color" :value="color") {{ color }}
                select(v-model="storage.buttonStyle.background" :id="storage.buttonStyle.style === 'filled' ? 'buttonBackground' : 'buttonBorder'").weight
                  div.option-wrapper
                    option(v-for="color in ['transparent', '50', ...weights, '900']" :key="color" :value="color") {{ color }}
              div.range-container
                label(for="buttonBorderRadius").body-xs {{storage.buttonStyle.borderRadius}}rem
                input(type="range" min="0" max="3" step="0.1" v-model="storage.buttonStyle.borderRadius")#buttonBorderRadius
            li
              div.container
                label(for="button") Form field styles
                select(id="button" v-model="storage.formStyle.style")
                  div.option-wrapper
                    option(v-for="style in ['filled', 'outlined']" :key="style" :value="style") {{ style }}
                select(v-model="storage.formStyle.color")#formColor.weight
                  div.option-wrapper
                    option(v-for="color in ['50', ...weights, '900']" :key="color" :value="color") {{ color }}
                select(v-model="storage.formStyle.background" :id="storage.formStyle.style === 'filled' ? 'buttonBackground' : 'buttonBorder'").weight
                  div.option-wrapper
                    option(v-for="color in ['transparent', '50', ...weights, '900']" :key="color" :value="color") {{ color }}
              div.range-container
                label(for="formBorderRadius").body-xs {{storage.formStyle.borderRadius}}rem
                input(type="range" min="0" max="3" step="0.1" v-model="storage.formStyle.borderRadius")#formBorderRadius
</template>

<script setup lang="ts">
  import { useStorage } from "@vueuse/core"
  const weights = ref([100, 200, 300, 400, 500, 600, 700, 800])

  const colors = groupCSSVarsByPrefix(jsonToCSSVars(useAppConfig().colors))
  //const colors = useAppConfig().colors
  const colorOptions = computed(() => Object.entries(colors).slice(1))
  const colorKeys = jsonToCSSVars(useAppConfig().colors).reduce((obj, x) => {
    const [rawKey, rawValue] = x.split(":")
    const key = rawKey.trim().replace(/^--/, "") // remove leading --
    const value = rawValue.trim().replace(";", "")
    return { ...obj, [rawKey]: value }
  }, {})

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

  const allIcons = Object.entries(useAppConfig().icons).reduce(
    (obj, [name, { icons }]) => ({ ...obj, [name]: icons }),
    {}
  )

  const backgrounds = [
    "#241e40",
    "#322f54",
    "#2a2b4c",
    "#353666",
    "#1d2236",
    "#222b46",
    "#1f1a45",
    "#322b62",
    "#1c1c1c",
    "#252525",
    "#000423",
    "#18193d",
    "#121b24",
    "#1d242f",
  ]

  const fonts = Object.keys(useAppConfig().fonts)
  const buttonStyle = reactive({
    style: "filled",
    color: "50",
    background: "200",
    borderRadius: 0.25,
  })

  const formStyle = reactive({
    style: "outlined",
    color: "50",
    background: "200",
    borderRadius: 0.25,
  })

  const defaultStyles = {
    open: true,
    icon: "System UIcons",
    background: backgrounds[0],
    color: "--purple-100",
    headingFont: "Nunito",
    bodyFont: "Work+Sans",
    headingWeight: 800,
    bodyWeight: 400,
    buttonStyle,
    formStyle,
  }

  const storage = useStorage("trollui-styles", defaultStyles)
  const icons = useState("icons", () => allIcons[storage.value.icon])
  const activeColorFamily = computed(() => {
    const [x, y, color, variant] = storage.value.color.split("-")
    return color
  })

  const buttonStyles = computed(() => {
    if (storage.value.buttonStyle.style == "filled") {
      return `
				border-radius: ${storage.value.buttonStyle.borderRadius}rem;
				background: var(--${activeColorFamily.value}-${storage.value.buttonStyle.background});
				color: var(--${activeColorFamily.value}-${storage.value.buttonStyle.color});
				border: 1px solid var(--${activeColorFamily.value}-${storage.value.buttonStyle.background});
			`
    } else if (storage.value.buttonStyle.style == "outlined") {
      return `
				border-radius: ${storage.value.buttonStyle.borderRadius}rem;
				background: transparent;
				color: var(--${activeColorFamily.value}-${storage.value.buttonStyle.color});
				border: 1px solid var(--${activeColorFamily.value}-${storage.value.buttonStyle.background});
			`
    }
  })

  const formFieldStyles = computed(() => {
    const background =
      storage.value.formStyle.style === "filled"
        ? `var(--site-color-${storage.value.formStyle.background}`
        : "transparent"
    const border = `1px solid var(--site-color-${storage.value.formStyle.background})`
    return `
			--textbox-background: ${background};
			--textbox-border: ${border};
			--textbox-color: var(--site-color-${storage.value.formStyle.color});
			--textbox-border-radius: ${storage.value.formStyle.borderRadius}rem;
		`
  })

  const rootStyles = computed(() => {
    return `
				--body-font: ${
          storage.value.bodyFont.includes("+")
            ? `"${storage.value.bodyFont.replace("+", " ")}"`
            : storage.value.bodyFont
        };
				--heading-font: ${
          storage.value.headingFont.includes("+")
            ? `"${storage.value.headingFont.replace("+", " ")}"`
            : storage.value.headingFont
        };
				--body-weight: ${storage.value.bodyWeight};
				--heading-weight: ${storage.value.headingWeight};
				--site-color: var(${storage.value.color});
				//--site-background: ${storage.value.background};
				--site-color-50: var(--${activeColorFamily.value}-50);
				--site-color-100: var(--${activeColorFamily.value}-100);
				--site-color-200: var(--${activeColorFamily.value}-200);
				--site-color-300: var(--${activeColorFamily.value}-300);
				--site-color-400: var(--${activeColorFamily.value}-400);
				--site-color-500: var(--${activeColorFamily.value}-500);
				--site-color-600: var(--${activeColorFamily.value}-600);
				--site-color-700: var(--${activeColorFamily.value}-700);
				--site-color-800: var(--${activeColorFamily.value}-800);
				--site-color-900: var(--${activeColorFamily.value}-900);
				--near-white: color-mix(in lab, var(--site-color) 8%, white);
				${formFieldStyles.value}
			`
  })

  useHead({
    style: [
      {
        innerHTML: () => `:root {
						${rootStyles.value}
					}`,
      },
      {
        innerHTML: () => `.default-button {
						${buttonStyles.value}
					}`,
      },
    ],
  })

  const convertToObject = (array: string[]) => array.reduce((obj, x) => ({ ...obj, [x]: x }), {})
</script>

<style lang="scss">
  .styles {
    padding: 0 var(--side-padding);
  }

  .styles-list {
    --weight-width: 6rem;
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
    //grid-template-columns: repeat(12, 1fr);
    --sm-column: 1;
    --md-column: 2;
    --lg-column: 2;
    --xl-column: 2;

    grid-template-columns: repeat(2, 1fr);

    & > li {
      width: 100%;
    }

    @include viewport($medium-small-viewport + 5rem up) {
      grid-template-columns: repeat(4, 1fr);
    }

    @include viewport($medium-viewport up) {
      grid-template-columns: repeat(6, 1fr);
      --lg-column: 3;
      --xl-column: 6;
    }

    @include viewport($large-viewport + 5rem up) {
      grid-template-columns: repeat(12, 1fr);
    }

    li:nth-child(2) {
      grid-column: span var(--sm-column);
    }

    li:first-child {
      grid-column: span var(--md-column);
    }

    li:nth-child(4),
    li:nth-child(5),
    li:nth-child(3) {
      grid-column: span var(--lg-column);
    }

    li:nth-child(6),
    li:nth-child(7) {
      grid-column: span var(--xl-column);
    }

    select {
      border: var(--dropdown-border);
      color: var(--dropdown-color);
      font-size: var(--trigger-font-size);
      font-family: var(--body-font);
      border-radius: var(--dropdown-border-radius);
      //here

      button {
        color: var(--dropdown-color);
      }
    }

    select.weight {
      width: var(--weight-width);
    }

    & > li {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  }

  .container {
    width: 100%;
  }

  .container:not(:has(select + select)) {
    select {
      width: 100%;
    }
  }

  .container:has(> select:nth-child(4):nth-last-child(1)) {
    select:not(.weight) {
      width: calc(100% - (var(--weight-width) * 2));
    }
  }

  .container:has(select + select) {
    select:not(.weight) {
      width: calc(100% - var(--weight-width));
    }

    select {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-right: none;
      border-left: none;
    }

    select:first-of-type {
      border-left: 1px solid var(--site-color);
      border-top-left-radius: var(--dropdown-border-radius);
      border-bottom-left-radius: var(--dropdown-border-radius);
      padding-right: 0.15em;
    }

    select:last-of-type {
      border-right: 1px solid var(--site-color);
      border-top-right-radius: var(--dropdown-border-radius);
      border-bottom-right-radius: var(--dropdown-border-radius);
      padding-left: 0.15em;
    }
  }

  label {
    display: block;

    &.small-label {
      position: absolute;
    }
  }

  .scrollable {
    & label {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--site-background);
      color: var(--site-color);
      padding: 0 0.5em;
      margin-bottom: 0.5em;
    }
    [role="group"] {
      margin-bottom: 0.5em;
    }

    & option {
      display: flex;
      align-items: center;
      //cursor: pointer;
      outline-offset: -1px;

      &:focus-visible {
        outline-offset: -1px;
      }

      &:is(:focus, :hover) {
        color: inherit;
      }

      &:is(:checked) {
      }
    }
  }

  select > div {
    min-inline-size: calc(anchor-size(self-inline) + 20px);
    scroll-behavior: smooth;

    &.scrollable {
      max-block-size: 20lh;
      scrollbar-width: thin;

      option {
        &:before {
          content: "";
          display: block;
          width: 1em;
          aspect-ratio: 1;
          background: var(--color);
        }
      }
    }
  }

  select {
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;

    &::picker(select) {
      appearance: base-select;
    }

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
      content: v-bind(dropdownLink);
    }

    &:open {
      ::picker-icon {
        transform: rotate(180deg);
      }
    }

    option {
      background: var(--site-background);
      font-size: 0.875em;
      color: var(--dropdown-color);
      gap: 0.2em;

      &::checkmark {
        // content: v-bind(checkLink);
      }
    }

    .styles-list & {
      &[id$="Color"],
      &[id$="Background"],
      &[id$="Border"] {
        &:before {
          display: block;
          width: 1em;
          aspect-ratio: 1;
          position: absolute;
          transform: translateY(calc(-100% - 0.5rem));
          font-size: 1rem;
          color: var(--site-color);
        }
      }

      &[id$="Color"]:before {
        content: "Color";
      }

      &[id$="Background"]:before {
        content: "Background";
      }

      &[id$="Border"]:before {
        content: "Border";
      }
    }
  }

  selectedcontent {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .option-wrapper {
    margin-top: 0.5em;
    border: var(--dropdown-border);
    border-radius: var(--dropdown-border-radius);
    padding: 0.5em 0.25em;
    display: flex;
    gap: 0.25em;
    flex-direction: column;
  }
</style>

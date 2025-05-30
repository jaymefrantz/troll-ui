<template lang="pug">
  div(:class="theme").styles
    button(type="button" popovertarget="stylePopover") 
      Icon(name="heroicons-outline:color-swatch" size="2.5em")
      span.sr-only.button-text Change styles
      //-  pre {{JSON.stringify(storage, null, 2)}}
    clientOnly
      div(popover).expanding-outer#stylePopover
        div.expanding-inner
          ul.styles-list
            li.large-column
              <NativeDropdown v-model="storage.icon" label="Icons" :options="convertToObject(Object.keys(allIcons))" />
          span.default-label Colors
          ul.styles-list
            li.small-column
              <ColorDropdown v-model="storage.color" label="Primary" :compare="backgroundHex"/>
            li.small-column
              <ColorDropdown v-model="storage.bodyColor" label="Secondary" :compare="backgroundHex"/>
            li.small-column
              <ColorDropdown v-model="storage.background" label="Background"/>
            li.medium-column
              <FontDropdown id="heading" v-model:font="storage.headingFont" v-model:weight="storage.headingWeight" label="Heading" />
            li.medium-column
              <FontDropdown id="body" v-model:font="storage.bodyFont" v-model:weight="storage.bodyWeight" label="Body" />
            li.large-column
              <GroupStyles label="Button styles" :siteBackground="storage.background" v-model:color="storage.buttonStyle.color" v-model:border="storage.buttonStyle.border" v-model:background="storage.buttonStyle.background" v-model:borderWidth="storage.buttonStyle.borderWidth" v-model:borderRadius="storage.buttonStyle.borderRadius"/>
            li.large-column
              <GroupStyles label="Form field styles" :siteBackground="storage.background" v-model:color="storage.formStyle.color" v-model:border="storage.formStyle.border" v-model:background="storage.formStyle.background" v-model:borderWidth="storage.formStyle.borderWidth" v-model:borderRadius="storage.formStyle.borderRadius"/>
</template>

<script setup lang="ts">
  import { useStorage } from "@vueuse/core"

  /*
   	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  	<g fill="none" stroke="#7d5151" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
  		<path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z" />
  		<path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7m0-4h.01" />
  		<path d="m11 8l2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8" />
  	</g>
  </svg>
   */
  const colors = getColorOptions()

  const allIcons = Object.entries(useAppConfig().icons).reduce(
    (obj, [name, { icons }]) => ({ ...obj, [name]: icons }),
    {}
  )

  const buttonStyle = reactive({
    color: "--teal-50",
    background: "--teal-200",
    borderRadius: 1,
    borderWidth: 1,
  })

  const formStyle = reactive({
    color: "--teal-50",
    background: "--teal-200",
    borderRadius: 1,
    borderWidth: 1,
  })

  const defaultStyles = {
    open: true,
    icon: "System UIcons",
    background: "--custom-bg-1",
    color: "--teal-500",
    bodyColor: "--grey-300",
    headingFont: "Nunito",
    bodyFont: "Work+Sans",
    headingWeight: 800,
    bodyWeight: 400,
    buttonStyle,
    formStyle,
  }

  const storage = useStorage("trollui-styles", defaultStyles)
  const icons = useState("icons", () => allIcons[storage.value.icon])
  const iconSet = useState("iconSet", () => defaultStyles.icon)
  const siteColor = useState("color", () => colors[defaultStyles.color])

  const backgroundHex = computed(() => colors[storage.value.background])

  const theme = computed(() => {
    return `${
      parseInt(storage.value.background.replace("--", "").split("-").at(-1)) > 300
        ? "dark"
        : "light"
    }-theme`
  })

  const activeColorFamily = computed(() => {
    const [x, y, color, variant] = storage.value.color.split("-")
    return color
  })

  const buttonStyles = computed(() => {
    const background = storage.value.buttonStyle.background
    return `
      border-radius: ${storage.value.buttonStyle.borderRadius}px;
      background: var(${background !== "--transparent" ? background : "--site-background"});
      color: var(${storage.value.buttonStyle.color});
      border: ${storage.value.buttonStyle.borderWidth}px solid var(${
      storage.value.buttonStyle.border
    });`
  })

  const formFieldStyles = computed(() => {
    const background = storage.value.formStyle.background
    return `
   	--textbox-background: var(${background !== "--transparent" ? background : "--site-background"});
   	--textbox-border: ${storage.value.formStyle.borderWidth}px solid var(${
      storage.value.formStyle.border
    });
   	--textbox-color: var(${storage.value.formStyle.color});
   	--textbox-border-radius: ${storage.value.formStyle.borderRadius}px;
    --textbox-padding-x: ${storage.value.formStyle.borderRadius / 4}px;
   `
  })

  watch(
    () => storage.value.icon,
    async name => {
      icons.value = allIcons[name]
      dropdownIcon.value = {
        name: icons.value["arrow-down"] ?? "qlementine-icons:chevron-down-16",
        size: "1em",
      }
      iconSet.value = name
    }
  )

  watch(
    () => storage.value.color,
    async color => {
      siteColor.value = colors[color]
    }
  )

  const dropdownIcon = useState("dropdownIcon", () => ({
    name: icons.value["arrow-down"] ?? "qlementine-icons:chevron-down-16",
    size: "1em",
  }))

  const dropdownLink = computed(() => {
    const [family, name] = dropdownIcon.value.name.split(":")
    const color = colors[storage.value.formStyle.color]
    return `url(https://api.iconify.design/${family}/${name}.svg?width=1.75em&color=${color.replace(
      "#",
      "%23"
    )})`
  })

  const checkLink = computed(() => {
    const icon = icons.value.check
    if (icon == undefined) {
      return "qlementine-icons:check-tick-16"
    }

    const color = colors[storage.value.formStyle.color]
    const [family, name] = icon.split(":")
    return `url(https://api.iconify.design/${family}/${name}.svg?height=1.75em&color=${color.replace(
      "#",
      "%23"
    )})`
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
      --site-secondary-color: var(${storage.value.bodyColor});
   		--site-background: var(${storage.value.background});
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
      --transparent: var(--site-background);
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

  onMounted(() => {
    setTimeout(() => {
      siteColor.value = colors[storage.value.color]
    }, 0)
  })

  const convertToObject = (array: string[]) => array.reduce((obj, x) => ({ ...obj, [x]: x }), {})
  function toTitleCase(str: string) {
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())
  }
</script>

<style lang="scss">
  .styles {
    // padding: 0 var(--side-padding);
    // width: 100%;
    // margin-top: 0;

    // margin: 1rem;
    // width: 100%;
    // max-width: 32rem;

    .default-label {
      --label-size: 0.875rem;
      --label-weight: 500;
    }

    .container {
      width: 100%;
    }

    .expanding-outer {
      // position: absolute;
      // z-index: 1;
      position-anchor: --tooltip;
      position: absolute;
      position-area: span-left bottom;
      max-width: 30rem;
      width: 100%;
      margin-top: 0.5rem;
      margin-right: 0;
      border: 0;
      background: transparent;
    }

    .expanding-inner {
      & > .default-label {
        margin-top: 1rem;
      }
    }
  }

  [popovertarget="stylePopover"] {
    display: block;
    background: transparent;
    border: 0;
    color: var(--site-color);
    anchor-name: --tooltip;

    &:hover {
      .dark-theme & {
        color: var(--site-color-100);
      }

      .light-theme & {
        color: var(--site-color-800);
      }
    }
  }

  select {
    border: var(--textbox-border);
    border-radius: var(--textbox-border-radius);
    color: var(--textbox-color);
    background: var(--textbox-background);
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    align-items: center;

    &:not(.color) {
      font-size: 1rem;
      padding: 0.375rem calc(0.75rem + var(--textbox-padding-x));

      .option-container {
        padding: calc(0.5rem + var(--textbox-padding-x)) 0;
      }
    }

    &,
    &::picker(select) {
      appearance: base-select;
    }

    &::picker(select) {
      background: var(--site-background); //here?
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
      content: "";
      background: v-bind(dropdownLink);
      background-position: center center;
      height: 1.5rem;
      width: 1.5rem;
      transition: transform 0.25s ease-in-out;
    }

    &:open {
      &::picker-icon {
        transform: rotate(180deg);
      }
    }

    ::checkmark {
      content: v-bind(checkLink);
    }

    &.native {
      option {
        color: var(--dropdown-color);
        & + option {
          margin-top: 2px;
        }
      }
    }
  }

  .option-container {
    margin-top: 0.5rem;
    border-radius: var(--dropdown-border-radius);
    border: var(--dropdown-border);
    background: var(--dropdown-background);
  }

  selectedcontent > * {
    transition: transform 1s var(--ease-spring-4), display 1s allow-discrete, opacity 1s;
    opacity: 1;

    @starting-style {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .styles-list {
    --sm-column: 2;
    --md-column: 2;
    --lg-column: 2;
    --xl-column: 2;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);

    @include viewport($small-viewport + 5rem up) {
      --sm-column: 1;
    }

    @include viewport($medium-small-viewport up) {
      grid-template-columns: repeat(6, 1fr);
      --sm-column: 2;
      --md-column: 3;
      --lg-column: 6;
    }

    .large-column {
      grid-column: span var(--lg-column);
    }

    .medium-column {
      grid-column: span var(--md-column);
    }

    .small-column {
      grid-column: span var(--sm-column);
    }

    & > li {
      width: 100%;
    }
  }
</style>

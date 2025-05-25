<template lang="pug">
  div.styles
    //- pre {{JSON.stringify(storage, null, 2)}}
    button(type="button" popovertarget="stylePopover") 
      span.button-text Change styles
    clientOnly
      div.expanding-outer#stylePopover
        div.expanding-inner
          ul.styles-list
            li.large-column
              <NativeDropdown v-model="storage.icon" label="Icons" :options="convertToObject(Object.keys(allIcons))" />
          span.default-label Colors
          ul.styles-list
            li.small-column
              <ColorDropdown v-model="storage.color" label="Primary" :compare="backgroundHex"/>
            li.small-column
              <ColorDropdown v-model="storage.bodyColor" label="Body color" :compare="backgroundHex"/>
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
  const backgroundThemes = {
    ...useAppConfig().colors.grey.reduce(
      (obj, hex, index) => ({ ...obj, [hex]: index > 3 ? "dark" : "light" }),
      {}
    ),
  }

  const backgroundHex = computed(() => colors[storage.value.background])
  const theme = computed(() => {
    return parseInt(storage.value.background.replace("--", "").split("-").at(-1)) > 300
      ? "dark"
      : "light"
  })

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
  const siteColor = useState("color", () => colors[defaultStyles.color])
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
    async icon => {
      icons.value = allIcons[icon]
      dropdownIcon.value = { name: icons.value["arrow-down"] ?? "", size: "1em" }
    }
  )

  watch(
    () => storage.value.color,
    async color => {
      siteColor.value = colors[color]
    }
  )

  const dropdownIcon = useState("dropdownIcon", () => ({
    name: icons.value["arrow-down"] ?? "",
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
      return ""
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
      --site-body-color: var(${storage.value.bodyColor});
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
    bodyAttrs: {
      class: () => `${theme.value}-theme`,
    },
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
    padding: 0 var(--side-padding);
    width: 100%;
    max-width: 32rem;

    .default-label {
      --label-size: 0.875rem;
      --label-weight: 500;
    }

    [popovertarget="stylePopover"] {
      display: block;
      text-align: right;
      margin-left: auto;
    }

    .container {
      width: 100%;
    }

    .expanding-inner {
      & > .default-label {
        margin-top: 1rem;
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
  //   --weight-width: 6rem;
  //   display: grid;
  //   gap: 1rem;
  //   margin-top: 1rem;
  //   //grid-template-columns: repeat(12, 1fr);
  //   --sm-column: 1;
  //   --md-column: 2;
  //   --lg-column: 2;
  //   --xl-column: 2;

  //   grid-template-columns: repeat(2, 1fr);

  //   & > li {
  //     width: 100%;
  //   }

  //   @include viewport($medium-small-viewport + 5rem up) {
  //     grid-template-columns: repeat(4, 1fr);
  //   }

  //   @include viewport($medium-viewport up) {
  //     grid-template-columns: repeat(6, 1fr);
  //     --lg-column: 3;
  //     --xl-column: 6;
  //   }

  //   @include viewport($large-viewport + 5rem up) {
  //     grid-template-columns: repeat(12, 1fr);
  //   }

  //   li:nth-child(2) {
  //     grid-column: span var(--sm-column);
  //   }

  //   li:first-child {
  //     grid-column: span var(--md-column);
  //   }

  //   li:nth-child(4),
  //   li:nth-child(5),
  //   li:nth-child(3) {
  //     grid-column: span var(--lg-column);
  //   }

  //   li:nth-child(6),
  //   li:nth-child(7) {
  //     grid-column: span var(--xl-column);
  //   }

  //   select {
  //     border: var(--dropdown-border);
  //     color: var(--dropdown-color);
  //     font-size: var(--trigger-font-size);
  //     font-family: var(--body-font);
  //     border-radius: var(--dropdown-border-radius);
  //     //here

  //     button {
  //       color: var(--dropdown-color);
  //     }
  //   }

  //   select.weight {
  //     width: var(--weight-width);
  //   }

  //   & > li {
  //     display: flex;
  //     gap: 1rem;
  //     align-items: center;
  //   }
  // }

  // .container {
  //   width: 100%;
  // }

  // .container:not(:has(select + select)) {
  //   select {
  //     width: 100%;
  //   }
  // }

  // .container:has(> select:nth-child(4):nth-last-child(1)) {
  //   select:not(.weight) {
  //     width: calc(100% - (var(--weight-width) * 2));
  //   }
  // }

  // .container:has(select + select) {
  //   select:not(.weight) {
  //     width: calc(100% - var(--weight-width));
  //   }

  //   select {
  //     border-top-right-radius: 0;
  //     border-bottom-right-radius: 0;
  //     border-top-left-radius: 0;
  //     border-bottom-left-radius: 0;
  //     border-right: none;
  //     border-left: none;
  //   }

  //   select:first-of-type {
  //     border-left: 1px solid var(--site-color);
  //     border-top-left-radius: var(--dropdown-border-radius);
  //     border-bottom-left-radius: var(--dropdown-border-radius);
  //     padding-right: 0.15em;
  //   }

  //   select:last-of-type {
  //     border-right: 1px solid var(--site-color);
  //     border-top-right-radius: var(--dropdown-border-radius);
  //     border-bottom-right-radius: var(--dropdown-border-radius);
  //     padding-left: 0.15em;
  //   }
  // }

  // label {
  //   display: block;

  //   &.small-label {
  //     position: absolute;
  //   }
  // }

  // .scrollable {
  //   & label {
  //     display: block;
  //     position: sticky;
  //     top: 0;
  //     z-index: 1;
  //     background: var(--site-background);
  //     color: var(--site-color);
  //     padding: 0 0.5em;
  //     margin-bottom: 0.5em;
  //   }
  //   [role="group"] {
  //     margin-bottom: 0.5em;
  //   }

  //   & option {
  //     display: flex;
  //     align-items: center;
  //     //cursor: pointer;
  //     outline-offset: -1px;

  //     &:focus-visible {
  //       outline-offset: -1px;
  //     }

  //     &:is(:focus, :hover) {
  //       color: inherit;
  //     }

  //     &:is(:checked) {
  //     }
  //   }
  // }

  // select > div {
  //   min-inline-size: calc(anchor-size(self-inline) + 20px);
  //   scroll-behavior: smooth;

  //   &.scrollable {
  //     max-block-size: 20lh;
  //     scrollbar-width: thin;

  //     option {
  //       &:before {
  //         content: "";
  //         display: block;
  //         width: 1em;
  //         aspect-ratio: 1;
  //         background: var(--color);
  //       }
  //     }
  //   }
  // }

  // select {
  //   &,
  //   &::picker(select) {
  //     appearance: base-select;
  //   }

  //   cursor: pointer;
  //   white-space: nowrap;
  //   text-overflow: ellipsis;

  //   &::picker(select) {
  //     background: var(--site-background);
  //     border: 0;
  //     transition: display allow-discrete 1s, opacity 0.25s, overlay 1s allow-discrete;
  //   }

  //   &:not(:open)::picker(select) {
  //     opacity: 0;
  //   }

  //   &:open::picker(select) {
  //     opacity: 1;

  //     @starting-style {
  //       opacity: 0;
  //     }
  //   }

  //   &::picker-icon {
  //     content: v-bind(dropdownLink);
  //   }

  //   &:open {
  //     ::picker-icon {
  //       transform: rotate(180deg);
  //     }
  //   }

  //   option {
  //     background: var(--site-background);
  //     font-size: 0.875em;
  //     color: var(--dropdown-color);
  //     gap: 0.2em;

  //   }

  //   .styles-list & {
  //     &[id$="Color"],
  //     &[id$="Background"],
  //     &[id$="Border"] {
  //       &:before {
  //         display: block;
  //         width: 1em;
  //         aspect-ratio: 1;
  //         position: absolute;
  //         transform: translateY(calc(-100% - 0.5rem));
  //         font-size: 1rem;
  //         color: var(--site-color);
  //       }
  //     }

  //     &[id$="Color"]:before {
  //       content: "Color";
  //     }

  //     &[id$="Background"]:before {
  //       content: "Background";
  //     }

  //     &[id$="Border"]:before {
  //       content: "Border";
  //     }
  //   }
  // }

  // selectedcontent {
  //   white-space: nowrap;
  //   text-overflow: ellipsis;
  // }

  // .option-wrapper {
  //   margin-top: 0.5em;
  //   border: var(--dropdown-border);
  //   border-radius: var(--dropdown-border-radius);
  //   padding: 0.5em 0.25em;
  //   display: flex;
  //   gap: 0.25em;
  //   flex-direction: column;
  // }
</style>

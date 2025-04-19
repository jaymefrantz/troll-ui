<template lang="pug">
  <checkbox class="disabled-checkbox" :icon="icons.checkbox" text="Disable fields" v-model="disabled"/>
  ul.textbox-list
    li.name
      TextField(ref="textField" v-model="name" label="Name" :disabled="disabled").floating
    li.email
      TextField(v-model="email" :icon="icons.email" type="email" label="Email" placeholder="Enter your email" :disabled="disabled")
    li.phone
      TextField(v-model="phone" :icon="icons.phone" type="phone" label="Phone" :disabled="disabled")
  <Props :props="textFieldProps" title="TextField Props" />
  p Selected checkboxes: {{ activeCheckboxes.length > 0 ? activeCheckboxes.join(', ') : "none"}}
  ul.checkbox-list
    li(v-for="checkbox in checkboxes" :key="checkbox")
      <checkbox ref="check" :text="checkbox" :icon="icons.checkbox" :id="checkbox" :disabled="disabled" v-model="activeCheckboxes" />
  <Props :props="checkProps" title="Checkbox Props" />
  ul.toggle-list
    li
      <Toggle ref="toggle" :disabled="disabled" class="rounded" text="Rounded toggle" v-model="roundedBool"/>
    li
      <Toggle :disabled="disabled" class="rectangle" v-bind="rectangle" v-model="rectangleBool"/>
  <Props :props="toggleProps" title="Toggle Props" />
</template>

<script setup lang="ts">
  const disabled = ref(false)
  const name = ref("")
  const email = ref("")
  const phone = ref("")
  const textField = ref(null)
  const textFieldProps = computed(() => Object.keys(textField.value?.props ?? {}))

  const check = ref(null)
  const activeCheckboxes = ref<string[]>(["two"])
  const checkboxes = ref<string[]>(["one", "two", "three"])
  const checkProps = computed(() =>
    Object.keys(check.value !== null ? check.value[0]?.props ?? {} : "")
  )

  const toggle = ref(null)
  const toggleProps = computed(() => Object.keys(toggle.value?.props ?? {}))
  const roundedBool = ref(true)
  const rectangleBool = ref(false)

  const icons = {
    email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.72 18.72"><path fill="currentColor" d="M1.976,16.3597c-.4607,0-.845-.154-1.153-.462-.308-.308-.4623-.6927-.463-1.154V3.9757c0-.4607.1543-.845.463-1.153.3087-.308.6927-.4623,1.152-.463h14.77c.46,0,.844.1543,1.152.463.308.3087.4623.693.463,1.153v10.769c0,.46-.1543.8443-.463,1.153s-.6927.4627-1.152.462H1.976ZM9.36,9.4757L1.36,4.2447v10.5c0,.1793.0577.3267.173.442.1153.1153.263.173.443.173h14.769c.1793,0,.3267-.0577.442-.173s.173-.263.173-.443V4.2437l-8,5.232ZM9.36,8.3597l7.692-5H1.668l7.692,5ZM1.36,4.2447v-.885,11.385c0,.1793.0577.3267.173.442.1153.1153.263.173.443.173h-.616V4.2447Z"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.72 18.72"><path fill="currentColor" d="M16.29,17.36c-1.6853,0-3.4133-.422-5.184-1.266-1.7707-.844-3.4187-2.029-4.944-3.555-1.5133-1.5253-2.692-3.1703-3.536-4.935s-1.266-3.4893-1.266-5.174c0-.3.1-.5533.3-.76s.45-.31.75-.31h2.473c.272,0,.5093.0857.712.257s.3397.391.411.659l.496,2.384c.0467.28.0383.5243-.025.733-.0633.2087-.1743.3797-.333.513l-2.194,2.046c.4107.7447.8643,1.4367,1.361,2.076.4967.6393,1.0267,1.245,1.59,1.817.58.58,1.2047,1.12,1.874,1.62.6693.4993,1.404.9707,2.204,1.414l2.139-2.177c.1627-.1753.3457-.291.549-.347.2027-.0553.4273-.0663.674-.033l2.103.43c.272.0667.4927.2037.662.411.1693.2073.254.4447.254.712v2.435c0,.3-.1033.55-.31.75-.2067.2-.46.3-.76.3"/></svg>`,
    checkbox: {
      name: "material-symbols:check",
      size: "1.35em",
    },
  }

  const rectangle = {
    text: "Kitty mood",
    labelPosition: "top",
    booleanLabels: {
      true: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#ffc022" d="M110.47 59.02c9.51-24.83 3.65-43.83.29-49.28c-1.33-2.16-3.89-2.76-6.25-2.02C98.29 9.68 81.5 23.4 74.08 42.6M17.53 59.02c-9.51-24.83-3.65-43.83-.29-49.28c1.33-2.16 3.89-2.76 6.25-2.02C29.71 9.68 46.5 23.4 53.92 42.6"/><path fill="#ffc022" d="M114.11 70.76C112.31 44.78 94.44 26.3 64 26.3S15.69 44.78 13.89 70.76c-1.05 15.14 5.05 28.01 17.09 36.21c0 0 12.21 9.88 33.02 10.14c20.81-.26 33.02-10.14 33.02-10.14c12.03-8.2 18.14-21.07 17.09-36.21"/><path fill="#ff7043" d="M54.12 45.02c1.13.96 3.42.82 4.75-.72c1.61-1.87 3.29-8.17 2.24-17.91c-4.67.17-9.09.84-13.21 1.97c3.33 5.46 4.13 14.88 6.22 16.66m19.76 0c-1.13.96-3.42.82-4.75-.72c-1.61-1.87-3.29-8.17-2.24-17.91c4.67.17 9.09.84 13.21 1.97c-3.33 5.46-4.13 14.88-6.22 16.66" opacity="0.47"/><path fill="none" stroke="#9e9e9e" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="m122.41 64.63l-16.92 8.33m19.02 3.87l-18.15 3.16m16.05 12.98l-16.92-5.78M5.59 64.63l16.92 8.33M3.49 76.83l18.15 3.16M5.59 92.97l16.92-5.78"/><path d="M32.56 70.26c-.3 0-.6-.06-.89-.19a2.21 2.21 0 0 1-1.14-2.92c.35-.8 3.6-7.85 9.35-7.85c5.68 0 9.17 6.74 9.55 7.51c.54 1.1.09 2.43-1.01 2.97s-2.17-.12-2.97-1.01c-.97-1.08-3.08-3.5-5.57-3.5c-2.5 0-4.58 2.59-5.28 3.65c-.51.77-1.19 1.34-2.04 1.34m62.88 0c.3 0 .6-.06.89-.19a2.21 2.21 0 0 0 1.14-2.92c-.35-.8-3.6-7.85-9.35-7.85c-5.68 0-9.17 6.74-9.55 7.51c-.54 1.1-.09 2.43 1.01 2.97s2.17-.12 2.97-1.01c.97-1.08 3.08-3.5 5.57-3.5c2.5 0 4.58 2.59 5.28 3.65c.51.77 1.19 1.34 2.04 1.34m-39.48 6.72c-.05-2.86 4.06-4.24 7.95-4.3c3.89-.07 8.07 1.2 8.12 4.06s-4.86 6.64-7.95 6.64s-8.07-3.54-8.12-6.4"/><path fill="#fff" d="M90.06 90.38c-1.64-1.67-4.29-2.16-6.75-1.24c-2.71 1.02-11 4.13-15.22 1.45c-3.71-2.35-3.51-7.13-3.51-7.13h-1.57s.25 5.21-3.11 7.13c-4.35 2.5-12.51-.44-15.22-1.45c-2.45-.92-5.1-.43-6.75 1.24c-1.55 1.57-1.82 3.82-.72 5.88c2.32 4.35 10.58 11.71 26.78 11.77c16.2-.05 24.46-7.42 26.78-11.77c1.11-2.06.84-4.31-.71-5.88"/><path d="M91.58 88.8c-1.74-1.89-4.54-2.44-7.14-1.4c-2.87 1.15-11.64 4.68-16.11 1.64c-3.93-2.66-2.33-6.8-2.33-6.8h-4s1.22 4.62-2.33 6.8c-4.61 2.83-13.24-.5-16.11-1.64c-2.6-1.04-5.4-.49-7.14 1.4c-1.64 1.78-1.93 4.33-.76 6.66c2.46 4.92 11.2 13.26 28.34 13.32c17.15-.06 25.88-8.4 28.34-13.32c1.17-2.33.88-4.88-.76-6.66m-1.92 5.32c-2.01 4.01-9.95 11.61-25.66 11.66c-15.71-.06-23.65-7.65-25.66-11.66c-.61-1.23-.51-2.43.28-3.29c.57-.62 1.4-.95 2.3-.95c.49 0 1.01.1 1.52.3c5.61 2.25 13.68 4.83 18.89 1.36c1.2-.8 2.04-1.46 2.64-2c.01.01.02.02.03.02c.01-.01.02-.02.03-.02c.6.54 1.45 1.2 2.64 2c5.21 3.47 13.28.89 18.89-1.36c.51-.2 1.02-.3 1.52-.3c.9 0 1.73.33 2.3.95c.79.87.89 2.06.28 3.29"/><path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="2" d="M42.93 89.54v12.33M53.47 91.5v13.65M64 86.8v19.91m21.07-18.32v12.33M74.53 90.48v14.18"/><path fill="#ffd1d1" d="M92.16 36.23c-1.54-1.29-1.5-3.37-.6-5.16c2.16-4.31 7.33-8.78 9.16-10.23c3-2.38 5.32-3.18 6.21.65c1.65 7.08 1.52 16.69-.25 21.99c-.62 1.87-2.54 2.86-4.02 1.57zm-56.32 0c1.54-1.29 1.5-3.37.6-5.16c-2.16-4.31-7.33-8.78-9.16-10.23c-3-2.38-5.32-3.18-6.21.65c-1.65 7.08-1.52 16.69.25 21.99c.62 1.87 2.54 2.86 4.02 1.57z"/></svg>`,
      false: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#ffc022" d="M110.47 59.02c9.51-24.83 3.65-43.83.29-49.28c-1.33-2.16-3.89-2.76-6.25-2.02C98.29 9.68 81.5 23.4 74.08 42.6M17.53 59.02c-9.51-24.83-3.65-43.83-.29-49.28c1.33-2.16 3.89-2.76 6.25-2.02C29.71 9.68 46.5 23.4 53.92 42.6"/><path fill="#ffc022" d="M114.11 70.76C112.31 44.78 94.44 26.3 64 26.3S15.69 44.78 13.89 70.76c-1.05 15.14 5.05 28.01 17.09 36.21c0 0 12.21 9.88 33.02 10.14c20.81-.26 33.02-10.14 33.02-10.14c12.03-8.2 18.14-21.07 17.09-36.21"/><path fill="#ff7043" d="M54.12 45.02c1.13.96 3.42.82 4.75-.72c1.61-1.87 3.29-8.17 2.24-17.91c-4.67.17-9.09.84-13.21 1.97c3.33 5.46 4.13 14.88 6.22 16.66m19.76 0c-1.13.96-3.42.82-4.75-.72c-1.61-1.87-3.29-8.17-2.24-17.91c4.67.17 9.09.84 13.21 1.97c-3.33 5.46-4.13 14.88-6.22 16.66" opacity="0.47"/><path d="M55.96 76.97c-.05-2.86 4.06-4.24 7.95-4.3s8.07 1.2 8.12 4.06s-4.86 6.64-7.95 6.64c-3.08 0-8.07-3.54-8.12-6.4m10.51 11.34c2.44 2.37 6.18 3.1 11.86 1.16c3.4-1.16 6.21-4.1 8.06-6.56c.69-.91 2.16-.29 1.99.84c-.31 2.02-.79 4.26-1.54 5.72c-1.97 3.83-6.05 7.38-15.27 6.44c-2.53-.26-5.08-.25-7.6.11c-9.06 1.31-13.74.94-16.31.07c-1.16-.4-.92-2.09.3-2.14c2.57-.1 6.22-.38 9.31-1.25c2.84-.8 5.36-1.86 6.05-3.37s2.58-1.58 3.15-1.02"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M65.35 89.47c-.77-2.07-1.19-4.28-1.23-6.49"/><path fill="none" stroke="#f0592b" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M60.35 101.17c3.73 2.19 8.08 3.28 12.4 3.12"/><path fill="none" stroke="#9e9e9e" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M2.4 70.42s9.31-1.69 20.03 3.95M2.31 83.15s8.21-3.72 19.24-1.76M5.5 94.37s7.82-5.18 17.75-6.06m101.92-19.97s-9.36-1.38-19.88 4.62m20.4 8.1s-8.33-3.44-19.29-1.11m16.48 12.44s-7.99-4.92-17.94-5.45"/><path d="M33.85 63.78c0-2.98.95-7.41 2.42-7.85c.45-.13.99-.06 1.36.24c5.16 4.18 8.79 6.2 9.21 6.52c3.53 2.65-1.65 9.96-5.72 10.04c-3.93.06-7.27-3.94-7.27-8.95m60.29 0c0-3.27-.52-6.7-1.99-7.14c-.45-.13-.99-.06-1.36.24c-5.16 4.18-9.22 5.49-9.64 5.81c-3.53 2.65 1.65 9.96 5.72 10.04c3.93.06 7.27-3.94 7.27-8.95"/><path fill="#ffd1d1" d="M92.16 36.23c-1.54-1.29-1.5-3.37-.6-5.16c2.16-4.31 7.33-8.78 9.16-10.23c3-2.38 5.32-3.18 6.21.65c1.65 7.08 1.52 16.69-.25 21.99c-.62 1.87-2.54 2.86-4.02 1.57zm-56.32 0c1.54-1.29 1.5-3.37.6-5.16c-2.16-4.31-7.33-8.78-9.16-10.23c-3-2.38-5.32-3.18-6.21.65c-1.65 7.08-1.52 16.69.25 21.99c.62 1.87 2.54 2.86 4.02 1.57z"/></svg>`,
    },
  }
</script>

<style lang="scss" scoped>
  .disabled-checkbox {
    & + * {
      margin-top: 1em;
    }
  }

  .textbox-list {
    display: grid;

    align-items: flex-end;
    gap: 1em;

    @include viewport($medium-large-viewport up) {
      grid-template-columns: 1fr 1fr 12rem;
      // grid-template-columns: repeat(6, 1fr);

      // .name {
      //   grid-column: 1 / 3;
      // }

      // .email {
      //   grid-column: 3 / 6;
      // }

      // .phone {
      //   grid-column: 6 / 6;
      // }
    }

    :deep(input) {
      width: 100%;
    }
  }

  .textbox-container {
    --textbox-background: var(--site-background);
    --textbox-icon-size: 1.25em;
    --textbox-font-size: 1em;
    color: var(--dark-200);
    --textbox-color: var(--dark-200);
    --textbox-padding-x: 1rem;
    --textbox-icon-padding: 0.75rem;
    --textbox-padding-y: 0.75rem;
    --textbox-border: 1px solid var(--dark-400);
    position: relative;

    ::placeholder {
      color: var(--dark-400);
    }

    &:has(input:not(.floating)) :deep(.textbox-wrap) {
      margin-top: 0.35em;
    }

    &:has(input.floating) :deep(label) {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: var(--textbox-padding-x);
      transition: transform $medium, top $medium;
      z-index: 1;
    }

    //this means that there's some content
    &:has(.floating:not(:placeholder-shown)) :deep(label) {
      top: 0;
      transform: translateY(-50%) scale(0.75) translateX(calc(0.5em * -0.75));
      padding: 0 0.5em;
      background: var(--site-background);
    }

    &:has(input:hover:not([disabled])) {
      --textbox-border: 1px solid var(--primary);
    }

    &:has(input[disabled]) {
      --textbox-color: var(--dark-400);
      --textbox-border: 1px solid var(--dark-400);
      color: var(--dark-400);

      ::placeholder {
        color: var(--dark-600);
      }
    }

    #main &:has(input:focus-visible) :deep(input) {
      --textbox-border: 1px solid var(--primary);
      color: var(--dark-200) !important;
      outline: 0;
    }
  }

  .checkbox-list {
    & > li + li {
      margin-top: 0.35em;
    }
  }

  .checkbox-container {
    --checkbox-background: transparent;
    --checkbox-border: 1px solid var(--dark-400);
    --checkbox-border-radius: 0.15rem;
    --checkbox-color: var(--dark-200);
    --checkbox-icon-y: 50%;
    --checkbox-icon-x: calc(50% + 0.05em);

    &:has(input[type="checkbox"]:checked) {
      --checkbox-background: var(--primary);
      --checkbox-border: 1px solid var(--primary);
    }

    &:has(input[type="checkbox"]:not(:checked):not([disabled]):hover) {
      --checkbox-border: 1px solid var(--primary);
      & :deep(.checkbox) {
        box-shadow: 0 0 0 1px var(--primary);
      }
    }

    &:has(input[type="checkbox"][disabled]:checked) {
      --checkbox-background: var(--dark-400);
      --checkbox-border: 1px solid var(--dark-400);
      --checkbox-color: var(--dark-200);
      color: var(--dark-400);
    }

    &:has(input[type="checkbox"][disabled]:not(:checked)) {
      --checkbox-color: var(--dark-400);
      --checkbox-border: 1px solid var(--dark-400);
      color: var(--dark-400);
    }
  }

  .toggle-list {
    & > li + li {
      margin-top: 1.5em;
    }
  }

  .rounded {
    --toggle-background: linear-gradient(-45deg, #e8e8e8 0%, #979797 100%);
    &:has(input:checked) {
      --toggle-background: linear-gradient(-45deg, #fe519f 0%, #a274fe 100%);
    }
  }

  .rectangle {
    --toggle-background: transparent;
    --toggle-border: 1px solid var(--dark-600);
    --toggle-border-radius: 0.15rem;
    --toggle-width: 5.5rem;
    --toggle-knob-background: transparent;
    --toggle-knob-border: none;
    --toggle-padding-x: 0.75rem;

    :deep(.custom-toggle-knob) {
      display: inline-flex;
      align-items: center;
    }

    &:hover:not([disabled]) :deep(.custom-toggle) {
      //--toggle-border: 2px solid var(--dark-600);
      box-shadow: 0 0 0 1px var(--dark-400);
      --toggle-border: 1px solid var(--dark-400);
    }
  }

  .props-container {
    margin-top: 1.5em;

    & + * {
      border-top: 1px solid var(--dark-400);
      padding-top: 4em;
      margin-top: 4em;
    }
  }
</style>

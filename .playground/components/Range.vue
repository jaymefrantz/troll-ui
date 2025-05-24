<template lang="pug">
  div(:style="`--percentage: ${percentage}%`").input-container
    label(:for="id").default-label {{label}}
    div.input-wrap
      input(type="range" :min="min" :max="max" :step="step" v-model="value" :id="id")
    ul(:style="`grid-template-columns: repeat(${max + 1}, 1fr)`").label-list
      li(v-for="(label, index) in labels" :key="`${id}-${label}`" :class="index < value ? 'active' : ''")
        button(type="button" @click="value = index").label {{label}}
        //- span.label {{label}}
</template>

<script setup lang="ts">
  const value = defineModel()

  const props = withDefaults(
    defineProps<{
      label: string
      id?: string
      unit?: string
      min?: number
      max?: number
      step?: number
    }>(),
    {
      unit: "px",
      min: 0,
      max: 6,
      step: 1,
    }
  )

  const id = computed(() => {
    return props?.id || `Range-${useId()}`
  })

  const labels = new Array(props.max + 1).fill(0).map((_, i) => i)

  const percentage = computed(() => {
    return ((value.value - props.min) / (props.max - props.min)) * 100
  })
</script>

<style lang="scss" scoped>
  :global(.dark-theme .input-container) {
    --input-active: var(--site-color-200);
    --input-inactive: color-mix(in lab, var(--site-color-200) 20%, white);
  }

  :global(.light-theme .input-container) {
    --input-inactive: var(--site-color-600);
    --input-active: var(--site-color-400);
  }

  .input-wrap {
    position: relative;
    //color-mix(in lab, var(--site-color) 8%, white)
    &:before {
      content: "";
      position: absolute;
      height: 4px;
      width: var(--percentage);
      background: var(--input-active);
      top: calc(50% + 2px);
      left: 0;
      translate: 0 -50%;
      border-radius: 5px;
    }
  }

  li {
    &:not(.active) {
      color: var(--input-inactive);
    }

    &.active {
      color: var(--input-active);
    }
  }

  ul:has(li.active) li.active:not(:has(+ li.active)) + li .label,
  ul:not(:has(li.active)) > li:first-child .label {
    /* Styles for first li if NO li has the 'active' class */
    // color: green; /* example style */
    scale: 1.75;
    transform-origin: center;
    color: var(--input-active);

    &:before {
      transform: translateX(-50%) translateY(-7px);
    }
  }

  .label {
    font-size: 0.65rem;
    text-align: center;
    display: block;
    position: relative;
    pointer-events: none;
    transition: scale 0.2s ease-in-out, color 0.2s ease-in-out;
    padding: 0;
    border: 0;
    background: transparent;
    color: currentColor;

    &:before {
      content: "";
      display: inline-block;
      width: 7px;
      aspect-ratio: 1;
      background-color: currentColor;
      border-radius: 50%;
      left: 50%;
      position: absolute;
      transform: translateX(-50%) translateY(-15px);
      transition: transform 0.2s ease-in-out;
    }
  }

  .label-list {
    display: grid;
  }

  input[type="range"] {
    width: 100%;
    margin: 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      border: 1px solid #000000;
      height: 16px;
      width: 16px;
      // border-radius: 3px;
      background: #ffffff;
      cursor: pointer;
      margin-top: -4px;
      opacity: 0;
      // margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
      // box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
    }

    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 11px;
      cursor: pointer;
      background: var(--input-inactive);
      border-radius: 5px;
      // border-radius: 1.3px;
      border: 4px solid var(--site-background);
    }

    &:focus::-webkit-slider-runnable-track {
      background: #367ebd;
    }
  }
</style>

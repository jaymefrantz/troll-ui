<template lang="pug">
transition(name="dropdown-outer-wrap")
  div(v-show="expanded" :class="{ 'end': isEnd, expanded }" ref="outer").dropdown-outer-wrap
    //- pre {{JSON.stringify(size.height.value)}}
    div.dropdown-inner-wrap
      <slot/>
</template>

<script setup lang="ts">
  const outer = ref<HTMLDivElement | null>(null)
  const { height } = useElementBounding(outer)

  const props = defineProps<{
    expanded: boolean
    isEnd: boolean
  }>()

  defineExpose({
    height,
  })
</script>

<style lang="scss">
  .dropdown-outer-wrap {
    background-color: var(--dropdown-background, white);
    padding: var(--dropdown-outer-padding, 0.5em 0.35em);
    border-radius: var(--dropdown-border-radius);
    border: var(--dropdown-border);
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: var(--dropdown-wrap-z-index, 20);
    transition: var(
      --dropdown-transition,
      all var(--transition-duration, #{$medium-fast}) ease-in-out
    );
    margin-top: 0.5em;
    display: grid;
    overflow: hidden;

    &.expanded {
      grid-template-rows: 1fr;
    }

    &-enter-from,
    &-leave-to {
      opacity: 0;
      transform: var(--transform, translate(0 -0.5em));
      margin-top: 0;
      grid-template-rows: 0fr !important;

      .dropdown-inner-wrap {
        min-height: 0;
        visibility: hidden;
        padding: 0;
      }
    }

    &:after {
      content: "";
      position: absolute;
      bottom: 0.25em;
      left: 0.5em;
      width: calc(100% - 1.5em);
      height: 2.875em;
      background: var(
        --dropdown-gradient,
        linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)
      );
      transition: opacity 0.15s;
      opacity: 1;
      pointer-events: none;
    }

    &.end:after {
      opacity: 0;
    }
  }

  .dropdown-inner-wrap {
    padding: var(--dropdown-inner-padding, 0.35rem 0.35rem 0.25rem 0);
    overflow: hidden;
    transition: all 0.1s ease-in-out;

    & > ul {
      overflow-y: auto;
      max-height: var(--dropdown-height, 10rem);

      &::-webkit-scrollbar {
        width: var(--scollbar-width, 5px);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-color, $grey);
        border-radius: 5px;
      }

      & > li {
        cursor: pointer;
        padding: var(--option-padding, 0.2em 0.75em 0.15em);
        margin: var(--option-margin, 0.2em 0.35em 0.2em 0.1em);
        transition: var(--option-transition, all 0.15s ease-in-out);
        color: var(--option-color, $grey);
      }
    }
  }
</style>

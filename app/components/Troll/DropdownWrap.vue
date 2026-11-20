<template lang="pug">
transition(name="dropdown-outer-wrap"
    @before-enter="isTransitioning = true"
    @after-enter="() => { isTransitioning = false; emit('opened') }"
    @enter-cancelled="isTransitioning = false"
    @before-leave="isTransitioning = true"
    @after-leave="isTransitioning = false"
    @leave-cancelled="isTransitioning = false"
  )
  div(v-if="expanded" :class="{ 'start': isStart, 'end': isEnd, expanded }" ref="outer"
    :data-open="expanded ? 'true' : null"
    :data-present="isPresent ? 'true' : null"
  ).dropdown-outer-wrap
    //- pre {{JSON.stringify(size.height.value)}}
    div.dropdown-inner-wrap
      <slot/>
</template>

<script setup lang="ts">
  const outer = ref<HTMLDivElement | null>(null)
  const { height } = useElementBounding(outer)
  const isTransitioning = ref(false)

  const props = withDefaults(defineProps<{
    expanded: boolean
    isEnd: boolean
    isStart?: boolean
  }>(), { isStart: true })

  const emit = defineEmits<{ (e: "opened"): void }>()

  const isPresent = computed(() => props.expanded || isTransitioning.value)

  defineExpose({
    height,
  })
</script>

<style>
  .dropdown-outer-wrap {
    --troll-ui-default-transition:
      opacity var(--transition-duration, var(--troll-ui-ani-medium-fast)) ease-in-out,
      transform var(--transition-duration, var(--troll-ui-ani-medium-fast)) ease-in-out,
      margin-top var(--transition-duration, var(--troll-ui-ani-medium-fast)) ease-in-out,
      grid-template-rows var(--transition-duration, var(--troll-ui-ani-medium-fast)) ease-in-out;
    background-color: var(--dropdown-background, white);
    padding: var(--dropdown-outer-padding, 0.5em 0.35em);
    border-radius: var(--dropdown-border-radius);
    border: var(--dropdown-border);
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: var(--dropdown-wrap-z-index, 20);
    transition: var(--dropdown-transition, var(--troll-ui-default-transition));
    margin-top: 0.5em;
    display: grid;
    grid-template-rows: 1fr;
    overflow: hidden;
    opacity: 1;
    transform: translateY(0);
  }

  .dropdown-outer-wrap {
    --dropdown-top-fade: var(--dropdown-fade-height, 2.875em);
    --dropdown-bottom-fade: var(--dropdown-fade-height, 2.875em);

    &.start { --dropdown-top-fade: 0px; }
    &.end { --dropdown-bottom-fade: 0px; }
  }

  .dropdown-outer-wrap:not(.start.end) .dropdown-inner-wrap > ul {
    /* The second mask keeps the scrollbar fully visible. */
    mask-image:
      linear-gradient(to bottom, transparent, #000 var(--dropdown-top-fade),
        #000 calc(100% - var(--dropdown-bottom-fade)), transparent),
      linear-gradient(#000, #000);
    mask-size: calc(100% - var(--scollbar-width, 5px)) 100%, var(--scollbar-width, 5px) 100%;
    mask-position: left top, right top;
    mask-repeat: no-repeat;
  }

  .dropdown-outer-wrap-enter-active,
  .dropdown-outer-wrap-leave-active {
    transition: var(--dropdown-transition, var(--troll-ui-default-transition));
    will-change: opacity, transform, margin-top, grid-template-rows;
  }

  .dropdown-outer-wrap-enter-to,
  .dropdown-outer-wrap-leave-from {
    opacity: 1;
    transform: translateY(0);
    margin-top: 0.5em;
    grid-template-rows: 1fr;
  }

  .dropdown-outer-wrap-enter-from,
  .dropdown-outer-wrap-leave-to {
    opacity: 0;
    transform: var(--transform, translateY(-0.5em));
    margin-top: 0;
    grid-template-rows: 0fr;
  }

  .dropdown-inner-wrap {
    min-height: 0;
    padding: var(--dropdown-inner-padding, 0.35rem 0.35rem 0.25rem 0);
    overflow: hidden;

    & > ul {
      overflow-y: auto;
      max-height: var(--dropdown-height, 10rem);
      scroll-padding-top: var(--dropdown-fade-height, 2.875em);
      scroll-padding-bottom: var(--dropdown-fade-height, 2.875em);

      &::-webkit-scrollbar {
        width: var(--scollbar-width, 5px);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-color, var(--troll-ui-grey));
        border-radius: 5px;
      }

      & > li {
        cursor: pointer;
        padding: var(--option-padding, 0.2em 0.75em 0.15em);
        margin: var(--option-margin, 0.2em 0.35em 0.2em 0.1em);
        transition: var(--option-transition, all 0.15s ease-in-out);
        color: var(--option-color, var(--troll-ui-grey));
      }
    }
  }
</style>

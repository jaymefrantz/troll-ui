<template lang="pug">
  dialog(ref="dialog" :closedby="closedby" @close="close")
    <component v-if="closable && closeButton?.component" :is="closeButton.component" v-bind="closeButton.attrs ?? {}" @click="() => dialog.close()" class="close-dialog-button" :disabled="buttonDisabled"/>
    button(v-if="closable && !closeButton?.component" type="button" @click="() => dialog.close()" v-bind="closeButton.attrs ?? {}" class="close-dialog-button" :disabled="buttonDisabled")
      <Icon :name="closeButton?.icon ?? 'material-symbols:close-rounded'" :size="closeButton?.size"/>
    div.dialog-inner
      <slot/>
</template>

<script setup lang="ts">
  const dialog = ref<HTMLDialogElement | null>(null)
  const isOpen = ref(false)
  const icons = useState("icons")

  withDefaults(
    defineProps<{
      closable?: boolean
      buttonDisabled?: boolean
      closedby?: string
      closeButton?: Record<string, any>
    }>(),
    {
      closable: false,
      buttonDisabled: false,
      closedby: "any",
      closeButton: {},
    }
  )

  const emit = defineEmits<{
    (e: "close"): void
  }>()

  useHead({
    bodyAttrs: () => (isOpen.value ? { style: "position: fixed" } : {}),
  })

  function close() {
    if (dialog.value) {
      isOpen.value = false
      emit("close")
    }
  }

  defineExpose({
    show: () => {
      if (dialog.value) {
        isOpen.value = true
        dialog.value.show()
      }
    },
    open: () => {
      if (dialog.value) {
        isOpen.value = true
        dialog.value.showModal()
      }
    },
    close: () => {
      close()
    },
  })
</script>

<style scoped>
  dialog {
    position: fixed;
    inset: 0;
    z-index: 1000;
    border: 0;
    width: var(--dialog-width, calc(100% - 5rem));
    max-width: var(--dialog-max-width, var(--medium-large-viewport));
    /* border-radius: 1.25rem; */
    background: var(--dialog-background, var(--site-foreground));
    padding: var(--dialog-padding, 0);
    text-align: center;
    opacity: 0;
    transform: scale(0.65);
    transition:
      opacity 0.25s ease-in-out,
      transform 0.35s 0.1s ease-in-out,
      overlay 0.25s ease-in-out allow-discrete,
      display 0.25s ease-in-out allow-discrete;

    &:open {
      opacity: 1;
      transform: scale(1);

      &::backdrop {
        background-color: var(--dialog-backdrop-color, color-mix(in lab, var(--site-foreground) 80%, transparent));
        background-image: var(--dialog-backdrop-image, none);
        background-position: var(--dialog-backdrop-position, 0 0);
        background-size: var(--dialog-backdrop-size, auto);
        background-repeat: var(--dialog-backdrop-repeat, repeat);
      }
    }

    @starting-style {
      &:open {
        opacity: 0;
        transform: scale(0.65);
      }
    }

    .close-dialog-button {
      --button-icon-gap: 0.6em;
      position: absolute;
      top: var(--dialog-close-top, 0.5em);
      right: var(--dialog-close-right, 0.5em);
      padding: var(--dialog-close-padding, 1em);
      z-index: 1;
    }
  }

  ::backdrop {
    backdrop-filter: blur(5px);
    background: rgb(0 0 0 / 0%);
    transition: all 0.25s ease-in-out;
    @starting-style {
      &:open {
        background: rgb(0 0 0 / 0%);
      }
    }
  }

  .dialog-inner {
    padding: var(--dialog-inner-padding, clamp(1.5rem, 8vh, 4rem) 1em);
    height: 100%;
  }
</style>

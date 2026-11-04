<template lang="pug">
  div.autocomplete-item
    div.image-container
      img(:src="posterURL" :alt="title")
    div.text-container 
      p id: {{ id }}
      h2 {{ title }}
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    id: number
    posterURL: string
    imdbId: string
  }>()
</script>

<style scoped>
  .autocomplete-item {
    display: flex;
    padding: 1rem;
    border-radius: 0.25rem;
    overflow: hidden;
  }

  :global(.autocomplete-results-list > li) {
    border-radius: 0.5rem;
  }

  :global(.autocomplete-results-list > li + li) {
    border-top: 1px solid var(--dark-800);
  }

  .image-container {
    width: 7rem;
    margin-right: 1em;
  }
  .image-container img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
  }
</style>

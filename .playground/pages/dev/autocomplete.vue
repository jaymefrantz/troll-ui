<template lang="pug">
<Autocomplete ref="autocomplete" v-bind="{ itemComponent, items, label: 'Movies', placeholder: 'Search movies', options: movies.map(({ title }) => title) }" />
<Props :props="props" />
div.options-container
  p.subtitle Sample options
  ul.options-list
    li(v-for="movie in useObjectSort(movies, 'title')" :key="movie.id") {{ movie.title }}
</template>

<script setup lang="ts">
  const autocomplete = ref(null)
  const { data: movies } = await useFetch("https://api.sampleapis.com/movies/comedy")

  const movieObj = movies.value.reduce((obj, movie) => ({ ...obj, [movie.title.toLowerCase()]: { ...movie, text: movie.title } }), {})

  const props = computed(() => Object.keys(autocomplete.value?.props ?? {}))
  const itemComponent = resolveComponent("AutocompleteItem")
  const items = computed(() => {
    return autocomplete.value?.results.map(name => movieObj[name]) ?? []
  })
  
  
</script>

<style lang="scss">
  * + .options-container {
    margin-top: 3em;
  }

  .options-list {
    column-count: var(--column, 1);
    margin: 0 -0.875rem;

    @include viewport($medium-small-viewport up) {
      --column: 2;
    }

    @include viewport($medium-large-viewport up) {
      --column: 3;
    }

    @include viewport($extra-large-viewport up) {
      --column: 4;
    }

    & > li {
      font-size: 0.875em;
      line-height: 1.6;
      padding: 0.35rem 0.875rem;
    }
  }

</style>
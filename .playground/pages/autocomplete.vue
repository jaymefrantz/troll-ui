<template lang="pug">
  <TrollAutocomplete ref="autocomplete" @selected="movie = $event" :results="results" v-bind="{ label: 'Movies', placeholder: 'Search movies', items: movies, searchedProp: 'title', itemComponent  }" />
  div(v-if="movie !== null").movie-card
    img(:src="movie.posterURL" :alt="movie.title")
    h2 {{ movie.title }}
  <Props :props="props" />
  //-pre {{movie, null, "  "}}
  div.options-container
    p.subtitle Sample options
    ul.options-list
      li(v-for="movie in useObjectSort(Object.values(movies), 'title')" :key="movie.id") {{ movie.title }}
</template>

<script setup lang="ts">
  import stringSimilarity from "string-similarity"
  interface Movie {
    id: number
    title: string
    posterURL: string
    imdbId: string
  }

  const autocomplete = ref(null)
  const { data } = await useFetch("https://api.sampleapis.com/movies/comedy")
  const movies = ref(
    data.value.reduce((obj, movie) => {
      return { ...obj, [movie.title.toLowerCase()]: movie }
    }, {})
  )
  const itemComponent = resolveComponent("AutocompleteItem")
  const props = computed(() => Object.keys(autocomplete.value?.props ?? {}))
  const movie = ref<null | Movie>(null)
  const results = ref([])
  //console.log(autocomplete.value.query);
  const typedSearch = computed(() => {
    return autocomplete.value?.query
  })

  watch(typedSearch, useDebounceFn(setResults, 200))

  function setResults() {
    if (typedSearch.value.split("").length > 3 && Object.keys(movies.value).length > 0) {
      results.value = useObjectSort(
        stringSimilarity
          .findBestMatch(typedSearch.value.toLowerCase(), Object.keys(movies.value))
          .ratings.filter(({ rating }) => rating !== 0),
        "rating"
      )
        .reverse()
        .reduce((unique, item) => {
          //needs this reduce cause string similarity is doing some weird stuff and adding duplicates even though autocompleteItems are unique and clean
          return !unique.map(({ target }) => target).includes(item.target)
            ? [...unique, item]
            : unique
        }, [])
        .splice(0, 12)
        .map(({ target }) => target)
        .map(key => movies.value[key])
    } else {
      results.value = []
    }
  }
</script>

<style lang="scss">
  .autocomplete-container {
    --dropdown-height: 14rem;
    --option-padding: 0.75rem;
    --option-margin: 0 0.35em 0 0.1em;

    max-width: 30rem;
    --focus-color: var(--dark-200);
  }

  ul.autocomplete-results-list li:first-child {
    padding-top: 0;
  }

  .autocomplete-input-wrap:focus-within {
    outline-color: var(--primary) !important;
  }

  .autocomplete-results-list > li {
    border-radius: 0.2em;
  }

  .movie-card {
    display: inline-flex;
    margin-top: 2em;
    padding: 0.375em;
    border: 1px solid var(--primary);
    min-width: 36rem;
    border-radius: var(--border-radius);

    img {
      height: 6em;
      width: 6em;
      object-fit: cover;
      object-position: bottom;
      border-radius: 0.05rem;
    }

    h2 {
      padding-top: 1.25em;
      padding-left: 1em;
      font-size: 1em;
    }
  }

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

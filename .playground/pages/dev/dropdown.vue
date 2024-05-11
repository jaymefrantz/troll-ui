<template lang="pug">
<Dropdown :options="options" label="year"/>
</template>

<script setup lang="ts">
  const options = [
    { label: "Any year", value: "" },
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
    { label: "2019", value: "2019" },
    { label: "2018", value: "2018" },
    { label: "2017", value: "2017" },
    { label: "2016", value: "2016" },
    { label: "2015", value: "2015" },
    { label: "2014", value: "2014" },
    { label: "2013", value: "2013" },
  ]

</script>

<style lang="scss">

.dropdown-inner-wrap::-webkit-scrollbar-thumb {
  border-radius: 4px;
}

.dropdown-outer-wrap {
  border-radius: 1em;
  border: 1px solid #f7f7f7;
  box-shadow: 0.15rem 0.225rem 0 rgb(0 0 0 / 10%);
}

.dropdown-trigger, .dropdown-mobile-select-container {
  box-shadow: 0.15rem 0.225rem 0 rgb(0 0 0 / 10%);
  border-radius: 1.75rem;
  border: 1px solid #f7f7f7;

}

.dropdown-select-input {
  border-radius: 1.75rem;
}
//--option-hover-background: $lightest-magenta
// --option-selected-background: map-get($magenta, shadow)
//need font weight
.dropdown-mobile-select-container {
  padding-right: 2rem;
  padding-left: 0.25rem;
}

.dropdown-list > li {
  border-radius: 0.2em; 
}

</style>
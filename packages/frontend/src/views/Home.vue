<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <img
    alt="logo"
    :src="`${BASE_URL}icons/logo.svg`"
    class="<md:px-10 w-1/3 h-1/3 min-h-[100px] max-h-[400px] max-w-[400px] mb-5 mx-auto"
  >
  <HelloWorld />
</template>

<script setup lang="ts">
const BASE_URL = import.meta.env.BASE_URL;
</script>

<style lang="scss"></style>

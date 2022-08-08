<template>
  <div class="mx-auto w-full text-center">
    <div
      v-for="i in 3"
      :key="i"
      :style="`animation-delay: calc(-0.32s + 0.16s * ${i})`"
    />
  </div>
</template>

<style lang="scss" scoped>
  div > div {
    @apply w-3 h-3 bg-current rounded-1/2 inline-block;
    animation: spinner-bounce 1.4s infinite ease-in-out both;
  }

  @keyframes spinner-bounce {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }
</style>

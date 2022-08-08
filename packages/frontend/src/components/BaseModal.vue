<template>
  <BasePopover class="w-xl flex flex-col">
    <header
      v-if="$slots.header"
      class="sm:rounded-t-xl base-bg-highlight"
    >
      <div class="h-12 flex items-center justify-center relative mx-2">
        <slot name="header" />
      </div>
    </header>

    <div class="flex flex-col overflow-y-auto base-bg-highlight flex-1 p-6">
      <slot />
    </div>
  </BasePopover>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>

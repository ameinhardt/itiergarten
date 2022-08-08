<template>
  <div class="relative my-4">
    <label
      v-if="label"
      class="base-text absolute pointer-events-none left-4 right-auto transform translate-y-6 transition duration-200 ease"
      :class="{ small: value.length > 0, 'base-disabled': disabled }"
    >
      {{ label }}
    </label>
    <input
      :value="value"
      type="text"
      :disabled="disabled"
      required
      class="base-text w-full rounded border-b border-primary my-2 p-4 bg-transparent outline-none"
      :class="{ disabled: disabled }"
      @input="(ev : Event) => $emit('update:value', (ev.target as HTMLInputElement)?.value)"
      @keyup.enter="$emit('enter')"
    >
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: undefined
  },
  value: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
defineEmits(['update:value', 'enter']);
</script>

<style lang="scss" scoped>
  label.small {
    @apply text-xs transform -translate-y-1;
  }
</style>

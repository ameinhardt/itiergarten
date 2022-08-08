<template>
  <Teleport to="body">
    <Transition
      name="zoom"
      :duration="300"
    >
      <div
        v-if="show"
        class="flex items-center justify-center base-backdrop"
        :style="{ 'z-index': count + 100 }"
        @click="$emit('update:show', false)"
      >
        <div
          class="base-bg base-text base-shadow sm:rounded-xl min-w-xs <sm:w-full <sm:h-full max-h-full"
          :class="$attrs.class"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';

let count = 0;
export default defineComponent({
  inheritAttrs: false,
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show'],
  setup() {
    onMounted(() => count++);
    onUnmounted(() => count--);
    return { count: count++ };
  }
});
</script>

<style lang="scss" scoped>
  .zoom-enter-active > div,
  .zoom-leave-active > div {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .zoom-enter-from > div,
  .zoom-leave-to > div {
    @apply transform scale-50 opacity-0;
  }
</style>

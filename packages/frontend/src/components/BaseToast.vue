<template>
  <Teleport to="body">
    <TransitionGroup
      enter-active-class="animate-slide-in-down animate-duration-500"
      leave-active-class="animate-fade-out animate-duration-500"
    >
      <div
        v-for="{ id, message, type } in toasts"
        :key="id"
        class="absolute w-full mt-2 top-0 pointer-events-none"
      >
        <div
          class="base-bg-highlight flex items-center left-1/2 max-w-xs p-4 rounded-lg shadow top-3 mx-auto"
          :class="type ? `text-${type}` : 'text-petrol dark:text-white'"
          role="alert"
        >
          <div
            v-if="type"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          >
            <i-mdi-alert-octagon-outline v-if="type === 'error'" />
            <i-mdi-alert v-if="type === 'warning'" />
            <i-mdi-information-outline v-if="type === 'info'" />
          </div>
          <div class="ml-3 text-sm font-normal">
            {{ message }}
          </div>
          <button
            type="button"
            class="ml-auto -my-1.5 text-primary inline-flex text-sm pointer-events-auto"
            @click="remove(id)"
          >
            {{ $t('close') }}
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';
import { Toast } from '../models/Toast';

  interface ToastManagementType extends Toast {
    id: number;
  }

const toasts = ref<Array<ToastManagementType>>([]);

function remove(id: number) {
  clearTimeout(id);
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

function add(toast: Toast) {
  const id = window.setTimeout(() => remove(id), toast.duration ?? 3000);
  toasts.value.push({
    id,
    ...toast
  });
}

defineExpose({ add });
</script>

<style lang="scss"></style>

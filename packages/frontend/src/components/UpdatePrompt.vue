<template>
  <Teleport to="body">
    <Transition
      enter-active-class="animate-slide-in-down animate-duration-500"
      leave-active-class="animate-fade-out animate-duration-500"
    >
      <div
        v-if="offlineReady || needRefresh"
        class="absolute w-full mt-2 top-0 pointer-events-none"
      >
        <div
          class="base-text base-bg-highlight flex items-center left-1/2 max-w-xs p-4 rounded-lg shadow top-3 mx-auto"
          role="alert"
        >
          <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
            <i-mdi-information-outline />
          </div>
          <template v-if="offlineReady">
            <div class="ml-3 text-sm font-normal">
              {{ $t('updatePrompt.offlineReady') }}
            </div>
            <button
              type="button"
              class="ml-auto -my-1.5 text-primary inline-flex text-sm pointer-events-auto"
              @click="close"
            >
              {{ $t('close') }}
            </button>
          </template>
          <template v-if="needRefresh">
            <div class="ml-3 text-sm font-normal">
              {{ $t('updatePrompt.newContent') }}
            </div>
            <button
              v-if="needRefresh"
              class="btn-circle h-8 w-8 text-sm ml-auto -my-1.5 pointer-events-auto"
              @click="updateServiceWorker()"
            >
              <i-mdi-refresh />
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { reactive, toRefs } from 'vue';

const UPDATEINTERVAL = 5 * 60 * 1000, // 5min
  close = async () => {
    /* eslint-disable no-use-before-define */
    offlineReady.value = false;
    needRefresh.value = false;
    /* eslint-enable no-use-before-define */
  },
  { offlineReady, needRefresh, updateServiceWorker } = import.meta.env.DEV
    ? {
        ...toRefs(
          reactive({
            offlineReady: false,
            needRefresh: false
          })
        ),
        updateServiceWorker: close
      }
    : useRegisterSW({
      onRegistered(sw) {
        if (sw) {
          setInterval(async () => {
            await sw.update();
          }, UPDATEINTERVAL);
        }
      }
    });
</script>

<style>
  .swToast {
    position: absolute;
    background-color: white;
    top: 0;
    width: calc(100% - 20px);
    border-bottom: 1px solid lightgrey;
    padding: 10px;
    box-shadow: 5px 5px 5px lightgrey;
  }
</style>

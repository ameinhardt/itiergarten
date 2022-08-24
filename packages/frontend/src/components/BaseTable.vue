<template>
  <div class="base-table">
    <div
      v-if="!collapsed"
      class="base-table-header-group base-bg-highlight base-border-highlight"
    >
      <div>
        <div
          v-if="editable"
          class="px-4"
        />
        <div
          v-for="(column, idx) in columns"
          :key="idx"
        >
          {{ i18n.te(`${i18nBase}.${column}`) ? $t(`${i18nBase}.${column}`) : column }}
        </div>
        <div v-if="editable">
          {{ $t('components.table.action') }}
        </div>
      </div>
    </div>
    <div class="base-table-row-group">
      <div
        v-for="(_, rIdx) in rows"
        :key="rIdx"
      >
        <div
          v-if="editable"
          class="px-4 md:py-4 w-4"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              class="w-4 h-4 rounded base-border focus:ring-primary focus:ring-2"
            >
          </div>
        </div>
        <div
          v-for="(column, cIdx) in columns"
          :key="cIdx"
        >
          <div v-if="collapsed">
            {{ i18n.te(`${i18nBase}.${column}`) ? $t(`${i18nBase}.${column}`) : column }}
          </div>
          {{ rows[rIdx][cIdx] }}
        </div>
        <div
          v-if="editable"
          class="action"
        >
          <a
            href="#"
            class="font-medium text-primary"
          >{{ $t('components.table.edit') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { PropType, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n(),
  breakpoint = 'md',
  breakpoints = useBreakpoints(breakpointsTailwind),
  collapsed = breakpoints.smaller(breakpoint),
  properties = defineProps({
    columns: {
      type: Array as PropType<string[]>,
      required: true
    },
    rows: {
      type: Array as PropType<Array<(string | number | boolean | undefined)[]>>,
      required: true,
      validator: () => true
    },
    editable: {
      type: Boolean,
      default: false
    },
    i18nBase: {
      type: String,
      required: true
    }
  }),
  { columns, editable, rows } = toRefs(properties);
</script>

<style lang="scss">
.base-table {
  @apply border-collapse w-full text-sm text-left;
  > .base-table-header-group {
    @apply text-xs uppercase border-b;
    > div {
      > div {
        @apply py-3 px-6;
      }
    }
  }
  > .base-table-row-group {
    > div {
      @apply base-border base-bg border-b  hover:bg-white hover:dark:bg-gray-700;
      > div {
        @apply px-6 font-medium whitespace-nowrap;
      }
    }
  }
}
@media (min-width: 768px) {
  .base-table {
    @apply table;
    > div > div > div.action {
      @apply w-24;
    }
    > .base-table-header-group {
      @apply table-header-group;
      > div {
        @apply table-row;
        > div {
          @apply table-cell;
        }
      }
    }
    > .base-table-row-group {
      @apply table-row-group;
      > div {
        @apply table-row;
        > div {
          @apply table-cell py-4;
        }
      }
    }
  }
}
@media (max-width: 768px) {
  div {
    display: block;
  }
  .base-table-header-group {
    display: none;
  }
  .base-table-row-group {
    > div {
      @apply mb-4 pb-4;
      > div {
        padding-left: 3em;
        @apply flex;
        > div:nth-of-type(1) {
          min-width: 10em;
        }
      }
    }
  }
}
</style>

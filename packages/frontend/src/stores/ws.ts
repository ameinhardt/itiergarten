import { useWebSocket } from '@vueuse/core';
import { defineStore } from 'pinia';

const useWsStore = defineStore('ws', {
  state: () =>
    useWebSocket<string>(`${window.location.protocol.replace('http', 'ws')}${window.location.host}/api/ws`, {
      immediate: false,
      // autoClose: false,
      autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed() {
          console.error('failed to connect websocket after 3 tries');
        }
      }
    }),
  getters: {
    isOpen(): boolean {
      return ['CONNECTING', 'OPEN'].includes(this.status);
    }
  }
});

export { useWsStore };

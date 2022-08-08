import { defineConfig } from 'unocss';
// import { theme } from '@unocss/preset-wind';

const highlights = ['danger', 'error', 'info', 'primary', 'success', 'warning'];

export default defineConfig({
  safelist: highlights.map((severity) => `text-${severity}`),
  theme: {
    fontFamily: {
      roboto: ['Roboto', 'Arial']
    },
    colors: {
      primary: '#fa7473',
      secondary: '#058b8c',
      danger: 'orangered',
      error: 'red',
      info: 'blue',
      success: 'green',
      warning: 'orange'
    }
  }
});

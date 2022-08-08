/* eslint-disable eslint-comments/disable-enable-pair, dot-notation */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import virtual from '@rollup/plugin-virtual';
import { theme } from '@unocss/preset-wind';
import vue from '@vitejs/plugin-vue';
import LicensePlugin from 'rollup-plugin-oss';
import { presetAttributify, presetTypography, presetWind, transformerDirectives, transformerVariantGroup } from 'unocss';
import Unocss from 'unocss/vite';
/* eslint-disable import/no-unresolved */
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
/* eslint-enable import/no-unresolved */
import { defineConfig, loadEnv, Plugin, IndexHtmlTransformResult, ConfigEnv, UserConfig } from 'vite';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import packageJson from './package.json';
import unoconfig from './unocss.config';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : undefined,
  testkey = '../../tests/cert/localhost.key',
  testcert = '../../tests/cert/localhost.crt',
  langs = fs
    .readdirSync(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'src/locales'))
    .filter((f) => f.endsWith('.json'))
    .map((file) => file.replace(/.json$/, ''));

process.env.SUPPORTED_LOCALES = langs.join(',');
for (const key of ['title', 'name', 'author', 'description', 'version']) {
  process.env[`VITE_${key.toUpperCase()}`] = packageJson[key];
}

export default defineConfig((config: ConfigEnv) : UserConfig => {
  const environment = loadEnv(config.mode, path.dirname(url.fileURLToPath(import.meta.url)), ''),
    BASE_URL = environment.BASE_URL || '/',
    isProduction = environment.NODE_ENV !== 'development',
    pwaOptions: Partial<VitePWAOptions> = {
      base: BASE_URL,
      includeAssets: ['icons/logo.svg', 'icons/favicon=196.png', 'fonts/Roboto.woff2'],
      srcDir: 'sw',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      injectManifest: {
        globPatterns: ['**/*.{png,js,css,html,svg}']
      },
      manifest: {
        /* eslint-disable camelcase */
        name: 'ITiergarten',
        short_name: 'ITiergarten',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: `${BASE_URL}icons/favicon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${BASE_URL}icons/favicon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: `${BASE_URL}icons/favicon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${BASE_URL}icons/favicon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
        /* eslint-enable camelcase */
      }
    },
    TransformHtmlPlugin = (): Plugin => {
      // const localesPath = normalizePath(path.resolve('src/locales/'));
      return {
        name: 'html-plugin',
        transformIndexHtml(/* html, _ctx */) {
          /* const ifAbsolute = (...args) =>
            args
              .filter((str) => str && !str.startsWith('/'))
              .map((str) => `${str}/`)
              .join(' '); */
          const bgColorStyle = `html {background-color: ${theme.colors?.['blue']['50']};} html.dark {background-color: ${theme.colors?.['gray']['500']};}`,
            bgColorScript = '(()=>{const e=localStorage.getItem("dark");(!e||e==="auto"?window.matchMedia("(prefers-color-scheme: dark)").matches:e==="dark")&&document.documentElement.classList.add("dark")})();',
            tags: IndexHtmlTransformResult = [
            // add package.json title
              {
                tag: 'title',
                injectTo: 'head',
                children: packageJson.title
              }
            ];
          if (isProduction) {
            tags.push(
              {
                tag: 'meta',
                injectTo: 'head',
                attrs: {
                  name: 'application-name',
                  content: packageJson.title
                }
              },
              {
                tag: 'meta',
                injectTo: 'head',
                attrs: {
                  name: 'theme-color',
                  content: theme?.colors?.['gray']['500']
                }
              },
              // add CSP header
              {
                tag: 'meta',
                injectTo: 'head',
                attrs: {
                  'http-equiv': 'Content-Security-Policy',
                  content: [
                    "default-src 'self'",
                    "base-uri 'self'",
                    'connect-src \'self\'',
                    "form-action 'self'",
                    "frame-src 'none'",
                    "img-src 'self'",
                    `script-src 'self' 'sha256-${crypto.createHash('sha256').update(bgColorScript).digest('base64')}'`,
                    "script-src-attr 'none'",
                    `style-src 'self' 'sha256-${crypto.createHash('sha256').update(bgColorStyle).digest('base64')}'`,
                    "object-src 'none';upgrade-insecure-requests"
                  ].join(';')
                }
              },
              {
                tag: 'script',
                injectTo: 'head',
                children: bgColorScript
              },
              {
                tag: 'style',
                injectTo: 'head',
                children: bgColorStyle
              }
            );
          }
          return tags;
        }
      };
    };
  return {
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), './src')
      }
    },
    base: BASE_URL,
    build: {
      minify: isProduction,
      commonjsOptions: {
        ignoreTryCatch: (id) => !id.includes('swagger-ui')
      }
    },
    preview: {
      port: PORT,
      strictPort: true,
      https: {
        key: fs.existsSync(testkey) ? fs.readFileSync(testkey) : undefined,
        cert: fs.existsSync(testcert) ? fs.readFileSync(testcert) : undefined
      }
    },
    server: {
      port: PORT,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          secure: false,
          ws: true
        }
      }
    },
    plugins: [
      virtual({
        'virtual:locales': `export default {${langs
          .map(
            (lang) => `async ${lang}() {
          const [{ default: messages }] = await Promise.all([import('./src/locales/${lang}.json'), import('dayjs/locale/${lang}.js')]);
          return messages;
        }`
          )
          .join(',')}};`
      }),
      Components({
        resolvers: [VueUseComponentsResolver(), IconsResolver()]
      }),
      Icons(),
      Unocss({
        transformers: [transformerDirectives(), transformerVariantGroup()],
        presets: [presetAttributify(), presetTypography(), presetWind()]
      }),
      TransformHtmlPlugin(),
      LicensePlugin({
        extra: [
          {
            name: 'Google Roboto font',
            version: '29',
            author: 'Christian Robertson',
            license: 'Apache-2.0',
            repository: 'https://github.com/googlefonts/roboto',
            description: 'downloaded from https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2'
          }
        ]
      }),
      vue(),
      VitePWA(pwaOptions),
      vueI18n({
        include: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), './src/locales/*.json'),
        compositionOnly: true,
        runtimeOnly: true
      })
    ]
  };
});

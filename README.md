# ITiergarten monorepo

This is a setup for a basic javascript backend/frontend project. It can be used as a playground for quickly building simple applications.

## Stack
* General: [pnpm](https://pnpm.io), [typescript](https://www.typescriptlang.org), [eslint]('https://eslint.org)
* Frontend: [vue 3](https://v3.vuejs.org), [UnoCSS](https://github.com/unocss/unocss), [i18n](https://vue-i18n-next.intlify.dev), [pinia](https://pinia.vuejs.org), [vite](https://vitejs.dev), [pwa](https://github.com/antfu/vite-plugin-pwa)/[workbox](https://developers.google.com/web/tools/workbox), [vueuse](https://vueuse.org), [dayjs](https://day.js.org), [rollup oss license plugin](https://github.com/ameinhardt/rollup-plugin-oss)
* Backend: [rollup](https://rollupjs.org), [koajs](https://koajs.com), [winston](https://github.com/winstonjs/winston), [grant](https://github.com/simov/grant), [ajv](https://ajv.js.org), [koa-jwt](https://github.com/koajs/jwt), [ws](https://github.com/websockets/ws)
* Testing: [jest](https://jestjs.io/), [jest-json-schema](https://github.com/americanexpress/jest-json-schema), [@shelf/jest-mongodb](https://github.com/shelfio/jest-mongodb), [nock](https://github.com/nock/nock), [supertest](https://github.com/visionmedia/supertest)
* Recommended IDE Setup: [vscode](https://code.visualstudio.com), [volar](https://github.com/johnsoncodehk/volar), [i18nally](https://i18nally.org), [vscode-eslint](https://github.com/Microsoft/vscode-eslint), [search-node-modules](https://github.com/jasonnutter/vscode-search-node-modules)

## Install
```
git clone https://github.com/ameinhardt/itiergarten.git
cd itiergarten
npx pnpm install
```
Downloads the sourcecode, installs main and packages dependencies and runs a build after

## Development
```
pnpm dev
```
Spawns backend and frontend `pnpm run dev`. Make sure to have propper settings in place (.env.development, vite.config.ts proxy) to proxy vite's api calls to the backend.

In order to commit / push, assure that husky is aware of npx:
https://typicode.github.io/husky/#/?id=command-not-found

## Build
```
pnpm run build
```
Runs parallel builds in all relevant packages

## Run
```
pnpm run start
```
Starts the backend with the last build of the frontend

## Update dependencies
Use pnpm to update recursive dependencies to the latest version interactively:
```
pnpm up -iLr
```

### IDE Visual Studio Code
Visual Studio Code is recommended as IDE.
The `.vscode` directory contains useful settings, launch configurations and tasks for this monorepo. Additional configurations could be stored in a customized `<...>.code-workspace` file, for example:
```json
{
"settings": {
  "terminal.integrated.env.windows": {
    "NODE_EXTRA_CA_CERTS": "C:\\...\\CA-DE_pem.cer",
    "http_proxy": "http://localhost:3128",
    "https_proxy": "http://localhost:3128",
    "no_proxy": "https://artifactory.example.com",
    "volar.lowPowerMode": true
  },
  "eslint.nodePath": "C:\\...\\itiergarten\\node_modules"
  }
}
```

### Git hooks
For maintaining a clean repository, this project uses [husky](https://github.com/typicode/husky) git hooks together with [lint-staged](https://github.com/okonet/lint-staged) to check code quality. It assures that
* added code is following the lint guidelines on commit
* runs unit tests before push

If these steps fail, the git action will not complete.

### healthcheck
If the environment variable `HEALTHPORT` is set, a simple http server bound to `localhost` is created on this port. Upon request of any path, it checks the most important vital signs (e.g. own server or database reachable).\
The main `cli.js` accepts the commandline argument `-c` / `--check`, which requests the server and exits with code 0, if all checks are ok, otherwise it exits with code 1.\
These two features facilitate creating a (docker-) healthcheck. See also `docker-compose.yml`.

### Docker
To build your custom image on windows, e.g. with a local proxy, use:
```
docker build --rm --build-arg HTTP_PROXY=http://host.docker.internal:3128 --build-arg HTTPS_PROXY=http://host.docker.internal:3128/ --build-arg http_proxy=http://host.docker.internal:3128/ --build-arg https_proxy=http://host.docker.internal:3128/ -t itiergarten/server:latest .
```

### docker-compose
It is also possible to use the provided `docker-compose.yml` with environment variables.\
I.e. for a complete build:
```
export HTTP_PROXY=http://localhost:3128/
export HTTPS_PROXY=http://localhost:3128/
npx pnpm --ignore-scripts install
npm run build
export HTTP_PROXY=http://host.docker.internal:3128/
export HTTPS_PROXY=http://host.docker.internal:3128/
docker-compose build --parallel
docker-compose push
docker-compose up
```

## HTTPS / certificates
If you want to use tls, e.g. for validating https access, you can set NODE_EXTRA_CA_CERTS environment variable.
In docker environment, a volume can be mounted with potential certificates. See backend for related environment variables HTTPS_KEY, HTTPS_CERT and HTTPS_HSTS

# To do
### backend
* create tests for websockets

### Frontend
* integrate cypress for frontend testing
  * [vite integration](https://github.com/cypress-io/cypress-component-examples/blob/main/vite-vue/package.json)
  * [component testing example](https://github.com/cypress-io/cypress-component-examples/tree/main/vue-cli-vue-3-cypress)
* [colors](https://color.adobe.com/de/create/color-wheel)

# The vue based frontend

## Development
```
pnpm dev
```
Starts a nodemon watcher and typescript transpilation

## Build
```
pnpm build
```
Runs a production build

## Preview
```
pnpm preview --host
```
Starts the backend server with this frontend, e.g. for verifying CSP or HTTPS specific behavior.
For testing (e.g. serviceworker), you can create a ssl certificate, e.g. with subject alt name with:
 ```
 openssl req -new -x509 -newkey rsa:4096 -keyout localhost.key -out localhost.crt -sha256 -days 365 -nodes -subj "/C=DE/CN=<yourhostname>" -addext "subjectAltName = DNS:<yourhostname>" -addext "certificatePolicies = 1.2.3.4"
 ```
 Define their path in the environment variables `HTTPS_KEY` / `HTTPS_CERT`.

# Notes
This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` [SFCs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) and typescript

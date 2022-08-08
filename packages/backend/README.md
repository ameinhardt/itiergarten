# The node.js backend

## Configuration
All configurations can be stored in .env files. For facilitating the development, multiple files can be used. The first file that exists in this directory will be used out of:\
`.env.${NODE_ENV}.local`, `.env.${NODE_ENV}`, `.env.local` or `.env`.

In order to e.g. allow secure cookies on a non-secure communication, `PROXY` must be set to true. Usually that is the case in an app service cloud environment.

### Cryptographic key pair
You can create a new (passphraseless-) key pair with node.js and e.g. add the output to your .env file:
```js
// with node.js crypto (https://nodejs.org/docs/latest/api/crypto.html#cryptogeneratekeypairsynctype-options):
var { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'der'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'der',
    // cipher: 'aes-256-cbc',
    // passphrase: ''
  }
});
publicKey = publicKey.toString('base64');
privateKey = privateKey.toString('base64');

// or with webcrypto: (crypto = crypto.webcrypto)
var {
  publicKey,
  privateKey
} = await crypto.subtle.generateKey({
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
}, true, ['sign', 'verify']);
publicKey = btoa(String.fromCharCode.apply(null, new Uint8Array(await crypto.subtle.exportKey('spki', publicKey)))); // Buffer.from(await crypto.subtle.exportKey('spki', publicKey)).toString('base64');
privateKey = btoa(String.fromCharCode.apply(null, new Uint8Array(await crypto.subtle.exportKey('pkcs8', privateKey)))); // Buffer.from(await crypto.subtle.exportKey('pkcs8', privateKey)).toString('base64');

console.log(`AUTH_PUBLICKEY=${publicKey}\nAUTH_PRIVATEKEY=${privateKey}`);
```


## Development
```
pnpm dev
```
Starts a nodemon watcher and typescript transpilation

## Build
```
pnpm dev:build
```
Builds the deliverables by transpiling the deliverables

```
pnpm build
```
Transpiles typescript, bundles and uglifies the deliverables

## Run
```
node index
```
Runs the builds

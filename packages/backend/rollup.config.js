import { builtinModules } from 'node:module';
import Replace from '@rollup/plugin-replace';
import Typescript from '@rollup/plugin-typescript';
// import LicensePlugin from 'rollup-plugin-oss';
import { terser as Terser } from 'rollup-plugin-terser';
import package_ from './package.json';

/*

importing (possibly cyclic) node.js dependencies would require
"@rollup/plugin-commonjs": "^22.0.0-4",
"@rollup/plugin-json": "^4.1.0",
"@rollup/plugin-node-resolve": "^13.1.2"

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';

*/

const plugins = [
  // LicensePlugin(),
  Replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.VERSION': JSON.stringify(package_.version),
    'process.env.NAME': JSON.stringify(package_.name)
  }),
  Typescript({
    module: 'ESNext'
    // , target: 'ES2021'
  }),
  Terser()
];

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    exports: 'named',
    format: 'cjs',
    sourcemap: true
  },
  preserveSymlinks: true,
  external: [...Object.keys(package_.dependencies), ...builtinModules.flatMap(p => [p, `node:${p}`])],
  /* external: () => (id) => {
    console.log(id);
    return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');
  }, */
  plugins
};

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { externalModules } from '@run-z/rollup-helpers';
import path from 'path';
import flatDts from 'rollup-plugin-flat-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default {
  input: {
    'http-header-value': './src/index.ts',
    'http-header-value.headers': './src/headers/index.ts',
    'http-header-value.node': './src/node/index.ts',
  },
  plugins: [
    commonjs(),
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
    }),
    nodeResolve(),
    sourcemaps(),
  ],
  external: externalModules(),
  manualChunks(id) {
    if (id.startsWith(path.resolve('src', 'headers') + path.sep)) {
      return 'http-header-value.headers';
    }
    if (id.startsWith(path.resolve('src', 'node') + path.sep)) {
      return 'http-header-value.node';
    }
    if (id.startsWith(path.resolve('src', 'impl') + path.sep)) {
      return 'http-header-value.base';
    }
    return 'http-header-value';
  },
  output: {
    dir: '.',
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          headers: {
            file: 'headers/index.d.ts',
          },
          node: {
            file: 'node/index.d.ts',
          },
        },
      }),
    ],
  },
};

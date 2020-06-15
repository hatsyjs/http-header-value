import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import path from 'path';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

const externals = [
  ...builtins,
];

function external(id) {
  return externals.some(ext => (id + '/').startsWith(ext + '/'));
}

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
      useTsconfigDeclarationDir: true,
    }),
    nodeResolve(),
    sourcemaps(),
  ],
  external,
  manualChunks(id) {
    if (id.startsWith(path.join(__dirname, 'src', 'headers') + path.sep)) {
      return 'http-header-value.headers';
    }
    if (id.startsWith(path.join(__dirname, 'src', 'node') + path.sep)) {
      return 'http-header-value.node';
    }
    if (id.startsWith(path.join(__dirname, 'src', 'impl') + path.sep)) {
      return 'http-header-value.base';
    }
    return 'http-header-value';
  },
  output: [
    {
      format: 'cjs',
      sourcemap: true,
      dir: './dist',
      entryFileNames: '[name].js',
      chunkFileNames: '_[name].js',
      hoistTransitiveImports: false,
    },
    {
      format: 'esm',
      sourcemap: true,
      dir: './dist',
      entryFileNames: '[name].mjs',
      chunkFileNames: '_[name].mjs',
      hoistTransitiveImports: false,
    },
  ],
};

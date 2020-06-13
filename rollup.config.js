import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default {
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
  input: {
    'http-header-value': './src/index.ts',
    'http-header-value.headers': './src/headers/index.ts',
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

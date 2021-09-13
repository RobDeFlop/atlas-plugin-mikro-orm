import baseConfig from './scripts/rollup.main.config';
import pkg from './package.json';

export default baseConfig({
  external: [],
  pkg
});

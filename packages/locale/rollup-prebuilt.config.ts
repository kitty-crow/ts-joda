import data from './prebuilt-packages.json' with { type: 'json' };
import { buildRollupConfigs, type LocalePackages } from './rollup-build-packages-config.ts';

export default buildRollupConfigs({
    destDir: 'dist/prebuilt',
    packages: data.packages as LocalePackages,
});

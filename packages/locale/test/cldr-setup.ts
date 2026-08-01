import { createRequire } from 'node:module';

interface CacheModule {
    registerLocaleData(path: string, data: unknown): void;
}

const require = createRequire(import.meta.url);
const cache = require('../src/format/cldr/CldrCache.js') as CacheModule;
const locales = ['en', 'en-GB', 'fr', 'de', 'ko', 'ja'] as const;

for (const locale of locales) {
    for (const file of ['ca-gregorian.json', 'timeZoneNames.json'] as const) {
        const path = `main/${locale}/${file}`;
        cache.registerLocaleData(path, require(`cldr-data/${path}`) as unknown);
    }
}

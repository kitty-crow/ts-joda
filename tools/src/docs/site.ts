const files = [
    'js-joda.min.js',
    'js-joda-extra.min.js',
    'js-joda-timezone.min.js',
    'js-joda-locale.min.js',
    'index.min.js',
    'index.js',
] as const;

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function load(base: URL, file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL(`runtime/${file}`, base).href;
        script.async = false;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error(`Failed to load ${file}`)), { once: true });
        document.head.append(script);
    });
}

async function start(): Promise<void> {
    const active = document.currentScript;
    const base = active instanceof HTMLScriptElement
        ? new URL('.', active.src)
        : new URL('assets/', document.baseURI);

    for (const file of files) {
        await load(base, file);
    }

    const scope = globalThis as typeof globalThis & Record<string, unknown>;
    for (const name of ['JSJoda', 'JSJodaLocale'] as const) {
        const api = scope[name];
        if (record(api)) {
            Object.assign(scope, api);
        }
    }

    console.info('js-joda documentation runtime loaded.');
}

void start().catch((error: unknown) => console.error(error));

/** Bind the plugin extension hook to a concrete public API object. */
export function bindUse<T extends object>(api: T): (plugin: (api: T) => void) => T {
    const used: Array<(api: T) => void> = [];
    return (plugin: (api: T) => void): T => {
        if (!used.includes(plugin)) {
            plugin(api);
            used.push(plugin);
        }
        return api;
    };
}

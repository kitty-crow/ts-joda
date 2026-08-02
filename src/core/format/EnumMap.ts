import type { TemporalField } from '../temporal/TemporalField.ts';

/** Small map keyed by temporal enum names. */
export class EnumMap {
    private _map: Record<string, number | undefined> = Object.create(null) as Record<string, number | undefined>;

    putAll(other: EnumMap): this {
        Object.assign(this._map, other._map);
        return this;
    }

    containsKey(key: TemporalField): boolean {
        return Object.prototype.hasOwnProperty.call(this._map, key.name()) && this.get(key) !== undefined;
    }

    get(key: TemporalField): number | undefined {
        return this._map[key.name()];
    }

    put(key: TemporalField, value: number): this {
        return this.set(key, value);
    }

    set(key: TemporalField, value: number): this {
        this._map[key.name()] = value;
        return this;
    }

    retainAll(keys: readonly TemporalField[]): this {
        const retained: Record<string, number | undefined> = Object.create(null) as Record<string, number | undefined>;
        for (const key of keys) {
            retained[key.name()] = this._map[key.name()];
        }
        this._map = retained;
        return this;
    }

    remove(key: TemporalField): number | undefined {
        const name = key.name();
        const value = this._map[name];
        this._map[name] = undefined;
        return value;
    }

    keySet(): Readonly<Record<string, number | undefined>> {
        return this._map;
    }

    clear(): void {
        this._map = Object.create(null) as Record<string, number | undefined>;
    }
}

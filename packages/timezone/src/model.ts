export interface PackedTzdb {
    readonly version: string;
    readonly zones: readonly string[];
    readonly links: readonly string[];
    readonly countries?: readonly string[];
}

export interface ZoneInfo {
    readonly name: string;
    readonly abbrs: readonly string[];
    readonly offsets: readonly number[];
    readonly untils: readonly number[];
    readonly population: number;
}

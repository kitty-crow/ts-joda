import type { ZoneInfo } from '../model.ts';

function digit(code: number): number {
    if (code > 96) {
        return code - 87;
    }
    if (code > 64) {
        return code - 29;
    }
    return code - 48;
}

function base60(value: string): number {
    const [whole = '', fraction = ''] = value.split('.');
    let start = 0;
    let sign = 1;
    let out = 0;

    if (value.charCodeAt(0) === 45) {
        start = 1;
        sign = -1;
    }

    for (let i = start; i < whole.length; i += 1) {
        out = 60 * out + digit(whole.charCodeAt(i));
    }

    let multiplier = 1;
    for (let i = 0; i < fraction.length; i += 1) {
        multiplier /= 60;
        out += digit(fraction.charCodeAt(i)) * multiplier;
    }

    return out * sign;
}

function numbers(values: readonly string[]): number[] {
    return values.map(base60);
}

function untils(values: readonly number[], length: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < length; i += 1) {
        out[i] = Math.round((out[i - 1] ?? 0) + (values[i] ?? 0) * 60_000);
    }
    if (length > 0) {
        out[length - 1] = Infinity;
    }
    return out;
}

function pick<T>(source: readonly T[], indices: readonly number[]): T[] {
    return indices.map((index) => {
        const value = source[index];
        if (value === undefined) {
            throw new TypeError(`Invalid packed time-zone index: ${index}`);
        }
        return value;
    });
}

function field(fields: readonly string[], index: number): string {
    const value = fields[index];
    if (value === undefined) {
        throw new TypeError('Invalid packed time-zone data');
    }
    return value;
}

export function unpack(value: string): ZoneInfo {
    const data = value.split('|');
    const name = field(data, 0);
    const abbreviations = field(data, 1).split(' ');
    const offsets = numbers(field(data, 2).split(' '));
    const indices = numbers(field(data, 3).split(''));
    const limits = untils(numbers(field(data, 4).split(' ')), indices.length);
    const population = Number(data[5] ?? 0) | 0;

    return {
        name,
        abbrs: pick(abbreviations, indices),
        offsets: pick(offsets, indices),
        untils: limits,
        population,
    };
}

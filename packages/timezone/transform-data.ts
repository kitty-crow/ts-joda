import { writeFileSync } from 'node:fs';
import moment from 'moment-timezone/moment-timezone-utils';
import tzdb from './data/unpacked/latest.json' with { type: 'json' };

interface PackedData {
    readonly version: string;
    readonly zones: readonly unknown[];
    readonly links?: readonly unknown[];
    readonly countries?: readonly unknown[];
}

interface MomentTzUtils {
    readonly tz: {
        filterLinkPack(data: typeof tzdb, start: number, end: number): PackedData;
    };
}

const utils = moment as unknown as MomentTzUtils;
const year = new Date().getFullYear();
const ranges = {
    '': [0, 9_999],
    '-1970-2030': [1_970, 2_030],
    '-2012-2022': [2_012, 2_022],
    '-2017-2027': [2_017, 2_027],
    '-10-year-range': [year - 5, year + 5],
} as const;

function write(suffix: string, start: number, end: number): void {
    const data = utils.tz.filterLinkPack(tzdb, start, end);
    const body = JSON.stringify(data, null, '\t');
    writeFileSync(`./data/packed/latest${suffix}.json`, body);
}

for (const [suffix, [start, end]] of Object.entries(ranges)) {
    write(suffix, start, end);
}

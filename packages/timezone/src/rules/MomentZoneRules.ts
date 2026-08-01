import {
    Duration,
    Instant,
    LocalDateTime,
    ZoneOffset,
    ZoneOffsetTransition,
    ZoneRules,
    type ZoneOffsetTransitionRule,
} from '@js-joda/core';
import type { ZoneInfo } from '../model.ts';

// The upstream declaration omits the runtime `null` case. Keep the historic
// behaviour at this one narrow compatibility boundary.
const noTransition = null as unknown as ZoneOffsetTransition;

export class MomentZoneRules extends ZoneRules {
    private readonly _tzdbInfo: ZoneInfo;
    private readonly _ldtUntils: LocalUntilIndex;

    constructor(info: ZoneInfo) {
        super();
        this._tzdbInfo = info;
        this._ldtUntils = new LocalUntilIndex(info.untils, info.offsets);
    }

    override isFixedOffset(): boolean {
        return this._tzdbInfo.offsets.length === 1;
    }

    override offsetOfInstant(instant: Instant): ZoneOffset {
        return this.offsetOfEpochMilli(instant.toEpochMilli());
    }

    override offsetOfEpochMilli(epochMilli: number): ZoneOffset {
        const index = binarySearch(this._tzdbInfo.untils, epochMilli);
        return ZoneOffset.ofTotalSeconds(this.offsetSeconds(index));
    }

    override offsetOfLocalDateTime(localDateTime: LocalDateTime): ZoneOffset {
        const info = this.offsetInfo(localDateTime);
        return info instanceof ZoneOffsetTransition ? info.offsetBefore() : info;
    }

    override validOffsets(localDateTime: LocalDateTime): ZoneOffset[] {
        const info = this.offsetInfo(localDateTime);
        return info instanceof ZoneOffsetTransition ? info.validOffsets() : [info];
    }

    override transition(localDateTime: LocalDateTime): ZoneOffsetTransition {
        const info = this.offsetInfo(localDateTime);
        return info instanceof ZoneOffsetTransition ? info : noTransition;
    }

    override standardOffset(_instant: Instant): ZoneOffset {
        return unsupported('ZoneRules.standardOffset');
    }

    override daylightSavings(_instant: Instant): Duration {
        return unsupported('ZoneRules.daylightSavings');
    }

    override isDaylightSavings(_instant: Instant): boolean {
        return unsupported('ZoneRules.isDaylightSavings');
    }

    override isValidOffset(localDateTime: LocalDateTime, offset: ZoneOffset): boolean {
        return this.validOffsets(localDateTime).some((candidate) => candidate.equals(offset));
    }

    override nextTransition(_instant: Instant): ZoneOffsetTransition {
        return unsupported('ZoneRules.nextTransition');
    }

    override previousTransition(_instant: Instant): ZoneOffsetTransition {
        return unsupported('ZoneRules.previousTransition');
    }

    override transitions(): ZoneOffsetTransition[] {
        return unsupported('ZoneRules.transitions');
    }

    override transitionRules(): ZoneOffsetTransitionRule[] {
        return unsupported('ZoneRules.transitionRules');
    }

    equals(other: unknown): boolean {
        if (this === other) {
            return true;
        }
        return other instanceof MomentZoneRules && this._tzdbInfo === other._tzdbInfo;
    }

    override toString(): string {
        return this._tzdbInfo.name;
    }

    private offsetInfo(localDateTime: LocalDateTime): ZoneOffset | ZoneOffsetTransition {
        const index = localBinarySearch(this._ldtUntils, localDateTime);
        const offsetIndex = index >> 1;

        if (index % 2 === 0) {
            return ZoneOffset.ofTotalSeconds(this.offsetSeconds(offsetIndex));
        }

        const beforeDateTime = this._ldtUntils.get(Math.max(index - 1, 0));
        const afterDateTime = this._ldtUntils.get(Math.min(index, this._ldtUntils.size - 1));
        const before = ZoneOffset.ofTotalSeconds(this.offsetSeconds(offsetIndex));
        const afterIndex = Math.min(offsetIndex + 1, this._tzdbInfo.offsets.length - 1);
        const after = ZoneOffset.ofTotalSeconds(this.offsetSeconds(afterIndex));

        return before.compareTo(after) > 0
            ? ZoneOffsetTransition.of(beforeDateTime, before, after)
            : ZoneOffsetTransition.of(afterDateTime, before, after);
    }

    private offsetSeconds(index: number): number {
        return -seconds(at(this._tzdbInfo.offsets, index));
    }
}

class LocalUntilIndex {
    readonly size: number;
    private readonly cache: Array<readonly [LocalDateTime, LocalDateTime] | undefined>;

    constructor(
        private readonly untilValues: readonly number[],
        private readonly offsetValues: readonly number[],
    ) {
        this.cache = [];
        this.size = untilValues.length * 2;
    }

    get(index: number): LocalDateTime {
        const pair = this.pair(index >> 1);
        return at(pair, index % 2);
    }

    private pair(index: number): readonly [LocalDateTime, LocalDateTime] {
        const cached = this.cache[index];
        if (cached !== undefined) {
            return cached;
        }
        const generated = this.generate(index);
        this.cache[index] = generated;
        return generated;
    }

    private generate(index: number): readonly [LocalDateTime, LocalDateTime] {
        const epochMilli = at(this.untilValues, index);
        if (epochMilli === Infinity) {
            return [LocalDateTime.MAX, LocalDateTime.MAX];
        }

        const instant = Instant.ofEpochMilli(epochMilli);
        const firstSeconds = seconds(at(this.offsetValues, index));
        const first = LocalDateTime.ofInstant(instant, ZoneOffset.ofTotalSeconds(-firstSeconds));
        const next = Math.min(index + 1, this.offsetValues.length - 1);
        const secondSeconds = seconds(at(this.offsetValues, next));
        const second = LocalDateTime.ofInstant(instant, ZoneOffset.ofTotalSeconds(-secondSeconds));

        return firstSeconds > secondSeconds ? [first, second] : [second, first];
    }
}

function localBinarySearch(values: LocalUntilIndex, value: LocalDateTime): number {
    let high = values.size - 1;
    let low = -1;
    while (high - low > 1) {
        const middle = (high + low) >> 1;
        if (!value.isBefore(values.get(middle))) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return high;
}

function binarySearch(values: readonly number[], value: number): number {
    let high = values.length - 1;
    let low = -1;
    while (high - low > 1) {
        const middle = (high + low) >> 1;
        if (at(values, middle) <= value) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return high;
}

function seconds(offset: number): number {
    const value = offset * 60;
    return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function at<T>(values: readonly T[], index: number): T {
    const value = values[index];
    if (value === undefined) {
        throw new RangeError(`Time-zone data index out of range: ${index}`);
    }
    return value;
}

function unsupported(message: string): never {
    throw new Error(`not supported: ${message}`);
}

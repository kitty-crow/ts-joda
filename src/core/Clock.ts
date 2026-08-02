import { abstractMethodFail, requireNonNull } from './assert.ts';
import type { Duration } from './Duration.ts';
import { Instant } from './Instant.ts';
import { ZoneId } from './ZoneId.ts';
import { ZoneOffset } from './ZoneOffset.ts';

export class Clock {
    static systemUTC(): Clock {
        return new SystemClock(ZoneOffset.UTC);
    }

    static systemDefaultZone(): Clock {
        return new SystemClock(ZoneId.systemDefault());
    }

    static system(zone: ZoneId): Clock {
        return new SystemClock(zone);
    }

    static fixed(fixedInstant: Instant, zoneId: ZoneId): Clock {
        return new FixedClock(fixedInstant, zoneId);
    }

    static offset(baseClock: Clock, duration: Duration): Clock {
        return new OffsetClock(baseClock, duration);
    }

    millis(): number {
        return abstractMethodFail('Clock.millis');
    }

    instant(): Instant {
        return abstractMethodFail('Clock.instant');
    }

    zone(): ZoneId {
        return abstractMethodFail('Clock.zone');
    }

    withZone(_zone: ZoneId): Clock {
        return abstractMethodFail('Clock.withZone');
    }

    equals(_other: unknown): boolean {
        return abstractMethodFail('Clock.equals');
    }
}

class SystemClock extends Clock {
    private readonly _zone: ZoneId;

    constructor(zone: ZoneId) {
        super();
        this._zone = requireNonNull(zone, 'zone');
    }

    override zone(): ZoneId {
        return this._zone;
    }

    override millis(): number {
        return Date.now();
    }

    override instant(): Instant {
        return Instant.ofEpochMilli(this.millis());
    }

    override equals(other: unknown): boolean {
        return other instanceof SystemClock && this._zone.equals(other._zone);
    }

    override withZone(zone: ZoneId): Clock {
        return zone.equals(this._zone) ? this : new SystemClock(zone);
    }

    override toString(): string {
        return `SystemClock[${this._zone}]`;
    }
}

class FixedClock extends Clock {
    private readonly _instant: Instant;
    private readonly _zoneId: ZoneId;

    constructor(fixedInstant: Instant, zoneId: ZoneId) {
        super();
        this._instant = requireNonNull(fixedInstant, 'fixedInstant');
        this._zoneId = requireNonNull(zoneId, 'zoneId');
    }

    override instant(): Instant {
        return this._instant;
    }

    override millis(): number {
        return this._instant.toEpochMilli();
    }

    override zone(): ZoneId {
        return this._zoneId;
    }

    override toString(): string {
        return 'FixedClock[]';
    }

    override equals(other: unknown): boolean {
        return other instanceof FixedClock
            && this._instant.equals(other._instant)
            && this._zoneId.equals(other._zoneId);
    }

    override withZone(zone: ZoneId): Clock {
        return zone.equals(this._zoneId) ? this : new FixedClock(this._instant, zone);
    }
}

class OffsetClock extends Clock {
    private readonly _baseClock: Clock;
    private readonly _offset: Duration;

    constructor(baseClock: Clock, offset: Duration) {
        super();
        this._baseClock = requireNonNull(baseClock, 'baseClock');
        this._offset = requireNonNull(offset, 'offset');
    }

    override zone(): ZoneId {
        return this._baseClock.zone();
    }

    override withZone(zone: ZoneId): Clock {
        return zone.equals(this._baseClock.zone())
            ? this
            : new OffsetClock(this._baseClock.withZone(zone), this._offset);
    }

    override millis(): number {
        return this._baseClock.millis() + this._offset.toMillis();
    }

    override instant(): Instant {
        return this._baseClock.instant().plus(this._offset) as Instant;
    }

    override equals(other: unknown): boolean {
        return other instanceof OffsetClock
            && this._baseClock.equals(other._baseClock)
            && this._offset.equals(other._offset);
    }

    override toString(): string {
        return `OffsetClock[${this._baseClock},${this._offset}]`;
    }
}

import { DateTimeException } from '../errors.ts';
import type { TemporalAccessor } from '../temporal/TemporalAccessor.ts';
import type { TemporalField } from '../temporal/TemporalField.ts';
import type { TemporalQuery } from '../temporal/TemporalQuery.ts';
import { DateTimeFormatter } from './DateTimeFormatter.ts';
import type { DecimalStyle } from './DecimalStyle.ts';

/** Internal state shared by date-time printer/parser components. */
export class DateTimePrintContext {
    private _temporal: TemporalAccessor;
    private _locale: unknown;
    private _symbols: DecimalStyle;
    private _optional = 0;

    constructor(temporal: TemporalAccessor, formatter: DateTimeFormatter);
    constructor(temporal: TemporalAccessor, locale: unknown, symbols: DecimalStyle);
    constructor(
        temporal: TemporalAccessor,
        localeOrFormatter: DateTimeFormatter | unknown,
        symbols?: DecimalStyle,
    ) {
        if (localeOrFormatter instanceof DateTimeFormatter) {
            this._temporal = DateTimePrintContext.adjust(temporal, localeOrFormatter);
            this._locale = localeOrFormatter.locale();
            this._symbols = localeOrFormatter.decimalStyle();
            return;
        }
        if (symbols === undefined) {
            throw new DateTimeException('DecimalStyle is required when no formatter is supplied');
        }
        this._temporal = temporal;
        this._locale = localeOrFormatter;
        this._symbols = symbols;
    }

    static adjust(temporal: TemporalAccessor, _formatter: DateTimeFormatter): TemporalAccessor {
        return temporal;
    }

    symbols(): DecimalStyle {
        return this._symbols;
    }

    startOptional(): void {
        this._optional++;
    }

    endOptional(): void {
        this._optional--;
    }

    getValueQuery<R>(query: TemporalQuery<R>): R | null {
        const result = this._temporal.query(query);
        if (result == null && this._optional === 0) {
            throw new DateTimeException(`Unable to extract value: ${this._temporal}`);
        }
        return result;
    }

    getValue(field: TemporalField): number | null {
        try {
            return this._temporal.getLong(field);
        }
        catch (error) {
            if (error instanceof DateTimeException && this._optional > 0) {
                return null;
            }
            throw error;
        }
    }

    temporal(): TemporalAccessor {
        return this._temporal;
    }

    locale(): unknown {
        return this._locale;
    }

    setDateTime(temporal: TemporalAccessor): void {
        this._temporal = temporal;
    }

    setLocale(locale: unknown): void {
        this._locale = locale;
    }
}

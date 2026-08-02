import {
    _ as core,
    ChronoField,
    DateTimeFormatterBuilder,
    IllegalArgumentException,
    TemporalField,
    TextStyle,
} from '@js-joda/core';
import type Locale from '../../Locale.ts';
import type { TextEntry, TextProvider } from '../../core-types.ts';
import { LocaleStore, styleKey, type TextMap } from '../LocaleStore.ts';
import LocalizedOffsetPrinterParser from '../parser/LocalizedOffsetPrinterParser.ts';
import TextPrinterParser from '../parser/TextPrinterParser.ts';
import WeekFieldsPrinterParser from '../parser/WeekFieldsPrinterParser.ts';
import CldrDateTimeTextProvider from './CldrDateTimeTextProvider.ts';
import CldrZoneTextPrinterParser from './CldrZoneTextPrinterParser.ts';

const { requireNonNull, requireInstance } = core.assert;

/** Locale-aware formatter builder backed by CLDR data. */
export default class CldrDateTimeFormatterBuilder extends DateTimeFormatterBuilder {
    override appendText(
        field: TemporalField,
        styleOrMap: TextStyle | Readonly<Record<string | number, string>> = TextStyle.FULL,
    ): this {
        return styleOrMap instanceof TextStyle
            ? this.appendTextFieldStyle(field, styleOrMap)
            : this.appendTextFieldMap(field, styleOrMap);
    }

    appendTextField(field: TemporalField): this {
        return this.appendTextFieldStyle(field, TextStyle.FULL);
    }

    appendTextFieldStyle(field: TemporalField, textStyle: TextStyle): this {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        requireNonNull(textStyle, 'textStyle');
        requireInstance(textStyle, TextStyle, 'textStyle');
        this._appendInternal(new TextPrinterParser(field, textStyle, new CldrDateTimeTextProvider()));
        return this;
    }

    appendTextFieldMap(
        field: TemporalField,
        textLookup: Readonly<Record<string | number, string>>,
    ): this {
        requireNonNull(field, 'field');
        requireInstance(field, ChronoField, 'field');
        requireNonNull(textLookup, 'textLookup');

        const values: Record<number, string> = {};
        for (const [rawValue, text] of Object.entries(textLookup)) {
            values[Number(rawValue)] = text;
        }
        const store = new LocaleStore({ [styleKey(TextStyle.FULL)]: values satisfies TextMap });
        const provider: TextProvider = {
            getText: (_field, value, style, _locale): string | null => store.getText(value, style),
            getTextIterator: (
                _field,
                style,
                _locale: Locale,
            ): IterableIterator<TextEntry> | null => store.getTextIterator(style),
        };
        this._appendInternal(new TextPrinterParser(field, TextStyle.FULL, provider));
        return this;
    }

    override appendWeekField(letter: string, count: number): this {
        requireNonNull(letter, 'letter');
        requireNonNull(count, 'count');
        this._appendInternal(new WeekFieldsPrinterParser(letter, count));
        return this;
    }

    override appendZoneText(textStyle: TextStyle): this {
        requireNonNull(textStyle, 'textStyle');
        requireInstance(textStyle, TextStyle, 'textStyle');
        this._appendInternal(new CldrZoneTextPrinterParser(textStyle));
        return this;
    }

    override appendLocalizedOffset(textStyle: TextStyle): this {
        requireNonNull(textStyle, 'textStyle');
        if (textStyle !== TextStyle.FULL && textStyle !== TextStyle.SHORT) {
            throw new IllegalArgumentException('Style must be either full or short');
        }
        this._appendInternal(new LocalizedOffsetPrinterParser(textStyle));
        return this;
    }
}

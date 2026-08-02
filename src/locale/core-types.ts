import {
    _ as core,
    type TemporalField,
    type TextStyle,
} from '@js-joda/core';
import type Locale from './Locale.ts';

export type PrintContext = InstanceType<typeof core.DateTimePrintContext>;
export type ParseContext = InstanceType<typeof core.DateTimeParseContext>;
export type TextBuffer = InstanceType<typeof core.StringBuilder>;

export interface PrinterParser {
    print(context: PrintContext, buffer: TextBuffer): boolean;
    parse(context: ParseContext, text: string, position: number): number;
}

export interface TextEntry {
    readonly key: string;
    readonly value: number;
    toString(): string;
}

export interface TextProvider {
    getText(field: TemporalField, value: number, style: TextStyle, locale: Locale): string | null;
    getTextIterator(
        field: TemporalField,
        style: TextStyle | null,
        locale: Locale,
    ): IterableIterator<TextEntry> | null;
}

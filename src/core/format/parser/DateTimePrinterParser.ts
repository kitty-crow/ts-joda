import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import type { StringBuilder } from '../StringBuilder.ts';

/** Shared internal contract for formatter printer/parser components. */
export interface DateTimePrinterParser {
    print(context: DateTimePrintContext, buffer: StringBuilder): boolean;
    parse(context: DateTimeParseContext, text: string, position: number): number;
}

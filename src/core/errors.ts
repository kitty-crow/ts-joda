/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

function withCause(message: string | undefined, fallback: string, cause?: unknown): string {
    let text = message || fallback;
    if (cause instanceof Error) {
        text += `\n-------\nCaused by: ${cause.stack}\n-------\n`;
    }
    return text;
}

type StackErrorConstructor = ErrorConstructor & { captureStackTrace?: (target: object, ctor?: Function) => void };
const StackError = Error as StackErrorConstructor;

abstract class JsJodaError extends Error {
    protected constructor(name: string, message?: string, cause?: unknown) {
        super(withCause(message, name, cause));
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
        StackError.captureStackTrace?.(this, new.target);
    }
}

export class DateTimeException extends JsJodaError {
    constructor(message?: string, cause?: unknown) {
        super('DateTimeException', message, cause);
    }
}

export class UnsupportedTemporalTypeException extends DateTimeException {
    constructor(message?: string, cause?: unknown) {
        super(message || 'UnsupportedTemporalTypeException', cause);
        this.name = 'UnsupportedTemporalTypeException';
    }
}

export class DateTimeParseException extends Error {
    private readonly _text: string;
    private readonly _index: number;

    constructor(message?: string, text = '', index = 0, cause?: unknown) {
        super(withCause(`${message || 'DateTimeParseException'}: ${text}, at index: ${index}`, 'DateTimeParseException', cause));
        this.name = 'DateTimeParseException';
        this._text = text;
        this._index = index;
        Object.setPrototypeOf(this, new.target.prototype);
        StackError.captureStackTrace?.(this, new.target);
    }

    parsedString(): string {
        return this._text;
    }

    errorIndex(): number {
        return this._index;
    }
}

export class ArithmeticException extends JsJodaError {
    constructor(message?: string, cause?: unknown) {
        super('ArithmeticException', message, cause);
    }
}

export class IllegalArgumentException extends JsJodaError {
    constructor(message?: string, cause?: unknown) {
        super('IllegalArgumentException', message, cause);
    }
}

export class IllegalStateException extends JsJodaError {
    constructor(message?: string, cause?: unknown) {
        super('IllegalStateException', message, cause);
    }
}

export class NullPointerException extends JsJodaError {
    constructor(message?: string, cause?: unknown) {
        super('NullPointerException', message, cause);
    }
}

/**
 * Decimal symbols used while printing and parsing date-time values.
 *
 * The core package deliberately keeps locale lookup out of this class. Locale
 * integrations can provide a configured instance through the formatter API.
 */
export class DecimalStyle {
    static STANDARD: DecimalStyle;

    private readonly _zeroDigit: string;
    private readonly _zeroDigitCharCode: number;
    private readonly _positiveSign: string;
    private readonly _negativeSign: string;
    private readonly _decimalSeparator: string;

    constructor(
        zeroDigit: string = '0',
        positiveSign: string = '+',
        negativeSign: string = '-',
        decimalSeparator: string = '.',
    ) {
        this._zeroDigit = zeroDigit;
        this._zeroDigitCharCode = zeroDigit.charCodeAt(0);
        this._positiveSign = positiveSign;
        this._negativeSign = negativeSign;
        this._decimalSeparator = decimalSeparator;
    }

    positiveSign(): string {
        return this._positiveSign;
    }

    withPositiveSign(positiveSign: string): DecimalStyle {
        return positiveSign === this._positiveSign
            ? this
            : new DecimalStyle(this._zeroDigit, positiveSign, this._negativeSign, this._decimalSeparator);
    }

    negativeSign(): string {
        return this._negativeSign;
    }

    withNegativeSign(negativeSign: string): DecimalStyle {
        return negativeSign === this._negativeSign
            ? this
            : new DecimalStyle(this._zeroDigit, this._positiveSign, negativeSign, this._decimalSeparator);
    }

    zeroDigit(): string {
        return this._zeroDigit;
    }

    withZeroDigit(zeroDigit: string): DecimalStyle {
        return zeroDigit === this._zeroDigit
            ? this
            : new DecimalStyle(zeroDigit, this._positiveSign, this._negativeSign, this._decimalSeparator);
    }

    decimalSeparator(): string {
        return this._decimalSeparator;
    }

    withDecimalSeparator(decimalSeparator: string): DecimalStyle {
        return decimalSeparator === this._decimalSeparator
            ? this
            : new DecimalStyle(this._zeroDigit, this._positiveSign, this._negativeSign, decimalSeparator);
    }

    convertToDigit(char: string): number {
        const value = char.charCodeAt(0) - this._zeroDigitCharCode;
        return value >= 0 && value <= 9 ? value : -1;
    }

    convertNumberToI18N(numericText: string): string {
        if (this._zeroDigit === '0') {
            return numericText;
        }
        const offset = this._zeroDigitCharCode - '0'.charCodeAt(0);
        let converted = '';
        for (let index = 0; index < numericText.length; index++) {
            converted += String.fromCharCode(numericText.charCodeAt(index) + offset);
        }
        return converted;
    }

    equals(other: unknown): boolean {
        return this === other || (
            other instanceof DecimalStyle
            && this._zeroDigit === other._zeroDigit
            && this._positiveSign === other._positiveSign
            && this._negativeSign === other._negativeSign
            && this._decimalSeparator === other._decimalSeparator
        );
    }

    hashCode(): string {
        return this._zeroDigit + this._positiveSign + this._negativeSign + this._decimalSeparator;
    }

    toString(): string {
        return `DecimalStyle[${this._zeroDigit}${this._positiveSign}${this._negativeSign}${this._decimalSeparator}]`;
    }

    static of(): never {
        throw new Error('Locale-specific decimal styles require @js-joda/locale');
    }

    static availableLocales(): never {
        throw new Error('Locale-specific decimal styles require @js-joda/locale');
    }
}

DecimalStyle.STANDARD = new DecimalStyle();

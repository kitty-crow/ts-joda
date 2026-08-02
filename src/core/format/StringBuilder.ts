/** Mutable string buffer used by the formatter implementation. */
export class StringBuilder {
    private _value = '';

    append(value: string | number): this {
        this._value += String(value);
        return this;
    }

    appendChar(value: string): this {
        this._value += value.charAt(0);
        return this;
    }

    insert(offset: number, value: string | number): this {
        this._value = this._value.slice(0, offset) + String(value) + this._value.slice(offset);
        return this;
    }

    replace(start: number, end: number, value: string): this {
        this._value = this._value.slice(0, start) + value + this._value.slice(end);
        return this;
    }

    length(): number {
        return this._value.length;
    }

    setLength(length: number): this {
        this._value = this._value.slice(0, length);
        return this;
    }

    toString(): string {
        return this._value;
    }
}

/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
/**
 * @private
 */
export class ParsePosition {
    _index: number;
    _errorIndex: number;
    constructor(index: number) {
        this._index = index;
        this._errorIndex = -1;
    }
    getIndex(): number {
        return this._index;
    }
    setIndex(index: number): void {
        this._index = index;
    }
    getErrorIndex(): number {
        return this._errorIndex;
    }
    setErrorIndex(errorIndex: number): void {
        this._errorIndex = errorIndex;
    }
}

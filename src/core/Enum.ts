/** Base class for the library's immutable pseudo-enums. */
export class Enum {
    readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    equals(other: unknown): boolean {
        return this === other;
    }

    toString(): string {
        return this._name;
    }

    toJSON(): string {
        return this.toString();
    }
}

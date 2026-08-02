declare module 'cldrjs' {
    export default class Cldr {
        static load(data: unknown): void;

        readonly locale: string;

        constructor(locale: string);

        get(path: string): unknown;
    }
}

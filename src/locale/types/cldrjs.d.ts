declare module 'cldrjs' {
    export default class Cldr {
        static load(data: unknown): void;

        readonly locale: string;
        readonly attributes: {
            readonly territory: string;
        };

        constructor(locale: string);

        get(path: string): unknown;
        main(path: string): unknown;
    }
}

/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */
import CldrDateTimeTextProvider from "./format/cldr/CldrDateTimeTextProvider.ts";
export default class Locale {
    static ENGLISH: Locale;
    static US: Locale;
    static UK: Locale;
    static CANADA: Locale;
    static FRENCH: Locale;
    static FRANCE: Locale;
    static GERMAN: Locale;
    static GERMANY: Locale;
    static KOREAN: Locale;
    static JAPANESE: Locale;
    static JAPAN: Locale;
    static ITALIAN: Locale;
    static ITALY: Locale;
    static CHINESE: Locale;
    static ROMANIAN: Locale;
    static SWEDISH: Locale;
    static SWEDEN: Locale;
    static HINDI: Locale;
    static RUSSIAN: Locale;
    static ARABIC: Locale;
    static CZECH: Locale;
    static DANISH: Locale;
    static GREEK: Locale;
    static SPANISH: Locale;
    static FINNISH: Locale;
    static LITHUANIAN: Locale;
    static NORWEGIAN: Locale;
    static NORWEGIAN_BOKMAL: Locale;
    static NORWEGIAN_NYNORSK: Locale;
    static POLISH: Locale;
    static SLOVAK: Locale;
    static TURKISH: Locale;
    static UKRAINIAN: Locale;
    private readonly _language: string;
    private readonly _country: string;
    private readonly _localeString: string;
    static getAvailableLocales(): string[] {
        return new CldrDateTimeTextProvider().getAvailableLocales();
    }
    // TODO: maybe use new Cldr(<'en'>) constructor instead?
    // see https://github.com/rxaviers/cldrjs#instantiate-a-locale-and-get-it-normalized
    constructor(language: string, country: string = '', localeString: string = '') {
        this._language = language;
        this._country = country;
        this._localeString = localeString;
    }
    language(): string {
        return this._language;
    }
    country(): string {
        return this._country;
    }
    localeString(): string {
        if (this._localeString.length > 0) {
            return this._localeString;
        }
        if (this._country.length > 0) {
            return `${this._language}-${this._country}`;
        }
        else {
            return this._language;
        }
    }
    toString(): string {
        return `Locale[${this.localeString()}]`;
    }
    equals(other: unknown): boolean {
        if (!other) {
            return false;
        }
        if (!(other instanceof Locale)) {
            return false;
        }
        return this.localeString() === other.localeString();
    }
}
export function _init(): void {
    //some samples/consts
    Locale.ENGLISH = new Locale('en');
    Locale.US = new Locale('en', 'US', 'en'); // default in cldr-data, no en-US
    Locale.UK = new Locale('en', 'GB');
    Locale.CANADA = new Locale('en', 'CA');
    Locale.FRENCH = new Locale('fr');
    Locale.FRANCE = new Locale('fr', 'FR', 'fr'); // default in cldr-data, no fr-FR
    Locale.GERMAN = new Locale('de');
    Locale.GERMANY = new Locale('de', 'DE', 'de'); // default in cldr-data, no de-DE
    Locale.KOREAN = new Locale('ko');
    Locale.JAPANESE = new Locale('ja', 'JP');
    Locale.JAPAN = new Locale('ja', 'JP', 'ja');
    Locale.ITALIAN = new Locale('it');
    Locale.ITALY = new Locale('it', 'IT', 'it');
    Locale.CHINESE = new Locale('zh');
    Locale.ROMANIAN = new Locale('ro');
    Locale.SWEDISH = new Locale('sv');
    Locale.SWEDEN = new Locale('sv', 'SE', 'sv');
    Locale.HINDI = new Locale('hi');
    Locale.RUSSIAN = new Locale('ru');
    Locale.ARABIC = new Locale('ar');
    Locale.CZECH = new Locale('cs');
    Locale.DANISH = new Locale('da');
    Locale.GREEK = new Locale('el');
    Locale.SPANISH = new Locale('es');
    Locale.FINNISH = new Locale('fi');
    Locale.LITHUANIAN = new Locale('lt');
    Locale.NORWEGIAN = new Locale('no');
    Locale.NORWEGIAN_BOKMAL = new Locale('nb', 'NO');
    Locale.NORWEGIAN_NYNORSK = new Locale('nn', 'NO');
    Locale.POLISH = new Locale('pl');
    Locale.SLOVAK = new Locale('sk');
    Locale.TURKISH = new Locale('tr');
    Locale.UKRAINIAN = new Locale('uk');
}

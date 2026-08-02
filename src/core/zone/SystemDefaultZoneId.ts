/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { SystemDefaultZoneRules } from "./SystemDefaultZoneRules.ts";
import { ZoneId } from "../ZoneId.ts";
export class SystemDefaultZoneId extends ZoneId {
    _rules!: SystemDefaultZoneRules;
    static SYSTEM: ZoneId;
    static UTC: ZoneId;
    constructor() {
        super();
        this._rules = new SystemDefaultZoneRules();
    }
    rules(): SystemDefaultZoneRules {
        return this._rules;
    }
    equals(other: unknown): boolean {
        if (this === other) {
            return true;
        }
        return false;
    }
    id(): string {
        return 'SYSTEM';
    }
}

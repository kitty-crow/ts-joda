/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

// @ts-expect-error Legacy JS module awaiting TypeScript migration.
import { _init as localeInit } from './Locale';
// @ts-expect-error Legacy JS module awaiting TypeScript migration.
import { _init as weekFieldsInit } from './temporal/WeekFields';
// @ts-expect-error Legacy JS module awaiting TypeScript migration.
import { _init as dateTimeFormatterInit } from './format/LocaleDateTimeFormatter';

let isInit = false;

function init(): void {
    if (isInit) {
        return;
    }

    isInit = true;

    localeInit();
    weekFieldsInit();
    dateTimeFormatterInit();
}

init();

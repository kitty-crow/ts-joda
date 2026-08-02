/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import { _init as localeInit } from './Locale.ts';
import { _init as weekFieldsInit } from './temporal/WeekFields.ts';
import { _init as dateTimeFormatterInit } from './format/LocaleDateTimeFormatter.ts';

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

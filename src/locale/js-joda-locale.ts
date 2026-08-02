/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */
import { use } from '@js-joda/core';
import plug from './plug.ts';
import Locale from './Locale.ts';
import { WeekFields } from './temporal/WeekFields.ts';
import { registerLocaleData } from './format/cldr/CldrCache.ts';
import './supplemental-data.ts';

use(plug);

export {
    Locale,
    WeekFields,
    registerLocaleData,
};

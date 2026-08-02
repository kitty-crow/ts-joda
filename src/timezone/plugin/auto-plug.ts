import { use } from '@js-joda/core';
import plug from './plug.ts';

export default function autoPlug(): void {
    use(plug);
}

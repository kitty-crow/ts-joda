import type { ZoneId } from '@js-joda/core';

type ZoneIdType = typeof ZoneId;

function resolved(Zone: ZoneIdType): ZoneId | null {
    try {
        return Zone.of(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
        return null;
    }
}

export default function extendSystemDefaultZoneId(Zone: ZoneIdType): void {
    const zone = resolved(Zone);
    if (zone === null) {
        return;
    }
    Zone.systemDefault = () => zone;
}

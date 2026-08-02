import { ZoneId } from '../../ZoneId.ts';
import { ZoneOffset } from '../../ZoneOffset.ts';
import { ZoneRegion } from '../../ZoneRegion.ts';
import { ChronoField } from '../../temporal/ChronoField.ts';
import type { TemporalQuery } from '../../temporal/TemporalQuery.ts';
import { ZoneRulesProvider } from '../../zone/ZoneRulesProvider.ts';
import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import type { StringBuilder } from '../StringBuilder.ts';
import type { DateTimePrinterParser } from './DateTimePrinterParser.ts';
import { OffsetIdPrinterParser } from './OffsetIdPrinterParser.ts';

/** Prints and parses a zone identifier using longest-match semantics. */
export class ZoneIdPrinterParser implements DateTimePrinterParser {
    constructor(
        private readonly query: TemporalQuery<ZoneId | null>,
        private readonly description: string,
    ) {}

    print(context: DateTimePrintContext, buffer: StringBuilder): boolean {
        const zone = context.getValueQuery(this.query);
        if (zone == null) {
            return false;
        }
        buffer.append(zone.id());
        return true;
    }

    parse(context: DateTimeParseContext, text: string, position: number): number {
        if (position >= text.length) {
            return ~position;
        }
        const region = this.parseRegion(text, position);
        const fixedEnd = this.parseFixedId(context, text, position);
        const fixedLength = fixedEnd >= 0 ? fixedEnd - position : 0;
        if (region !== null && region.parseLength > fixedLength) {
            context.setParsedZone(ZoneRegion.ofId(region.parsedZoneId));
            return position + region.parseLength;
        }
        return fixedEnd;
    }

    private parseRegion(text: string, position: number): ParsedRegion | null {
        const available = ZoneRulesProvider.getAvailableZoneIds();
        if (available.length === 0) {
            return null;
        }
        if (zoneIdTree.size !== available.length) {
            zoneIdTree = ZoneIdTree.create(available);
        }
        const maximum = text.length - position;
        let tree: ZoneIdTreeMap | undefined = zoneIdTree.root;
        let parsedZoneId: string | null = null;
        let parseLength = 0;
        while (tree !== undefined) {
            const candidate = text.slice(position, position + Math.min(tree.length, maximum));
            tree = tree.get(candidate);
            if (tree?.isLeaf) {
                parsedZoneId = candidate;
                parseLength = tree.length;
            }
        }
        return parsedZoneId === null ? null : { parsedZoneId, parseLength };
    }

    private parseFixedId(context: DateTimeParseContext, text: string, position: number): number {
        const next = text.charAt(position);
        if (next === '+' || next === '-') {
            const copy = context.copy();
            const end = OffsetIdPrinterParser.INSTANCE_ID.parse(copy, text, position);
            if (end < 0) {
                return end;
            }
            const seconds = copy.getParsed(ChronoField.OFFSET_SECONDS);
            if (seconds === undefined) {
                return ~position;
            }
            context.setParsedZone(ZoneOffset.ofTotalSeconds(seconds));
            return end;
        }

        const second = text.charAt(position + 1);
        if (context.charEquals(next, 'U') && context.charEquals(second, 'T')) {
            return context.charEquals(text.charAt(position + 2), 'C')
                ? this.parsePrefixedOffset(context, text, position, position + 3)
                : this.parsePrefixedOffset(context, text, position, position + 2);
        }
        if (
            context.charEquals(next, 'G')
            && context.charEquals(second, 'M')
            && context.charEquals(text.charAt(position + 2), 'T')
        ) {
            return this.parsePrefixedOffset(context, text, position, position + 3);
        }
        if (text.slice(position, position + 6) === 'SYSTEM') {
            context.setParsedZone(ZoneId.systemDefault());
            return position + 6;
        }
        if (context.charEquals(next, 'Z')) {
            context.setParsedZone(ZoneOffset.UTC);
            return position + 1;
        }
        return ~position;
    }

    private parsePrefixedOffset(
        context: DateTimeParseContext,
        text: string,
        prefixPosition: number,
        position: number,
    ): number {
        const prefix = text.slice(prefixPosition, position).toUpperCase();
        if (position < text.length && context.charEquals(text.charAt(position), 'Z')) {
            context.setParsedZone(ZoneId.ofOffset(prefix, ZoneOffset.UTC));
            return position;
        }
        const copy = context.copy();
        const end = OffsetIdPrinterParser.INSTANCE_ID.parse(copy, text, position);
        if (end < 0) {
            context.setParsedZone(ZoneId.ofOffset(prefix, ZoneOffset.UTC));
            return position;
        }
        const seconds = copy.getParsed(ChronoField.OFFSET_SECONDS);
        if (seconds === undefined) {
            return ~position;
        }
        context.setParsedZone(ZoneId.ofOffset(prefix, ZoneOffset.ofTotalSeconds(seconds)));
        return end;
    }

    toString(): string {
        return this.description;
    }
}

interface ParsedRegion {
    parsedZoneId: string;
    parseLength: number;
}

class ZoneIdTree {
    public constructor(readonly size: number, readonly root: ZoneIdTreeMap) {}

    static create(ids: readonly string[]): ZoneIdTree {
        const sorted = [...ids].sort((first, second) => first.length - second.length);
        const root = new ZoneIdTreeMap(sorted[0]!.length, false);
        for (const id of sorted) {
            root.add(id);
        }
        return new ZoneIdTree(sorted.length, root);
    }
}

class ZoneIdTreeMap {
    private readonly children = new Map<string, ZoneIdTreeMap>();

    constructor(readonly length: number, readonly isLeaf: boolean) {}

    add(zoneId: string): void {
        if (zoneId.length === this.length) {
            this.children.set(zoneId, new ZoneIdTreeMap(zoneId.length, true));
            return;
        }
        if (zoneId.length > this.length) {
            const prefix = zoneId.slice(0, this.length);
            let child = this.children.get(prefix);
            if (child === undefined) {
                child = new ZoneIdTreeMap(zoneId.length, false);
                this.children.set(prefix, child);
            }
            child.add(zoneId);
        }
    }

    get(zoneId: string): ZoneIdTreeMap | undefined {
        return this.children.get(zoneId);
    }
}

let zoneIdTree = new ZoneIdTree(0, new ZoneIdTreeMap(0, false));

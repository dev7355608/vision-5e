export class Matcher {

    /** @type {RegExp} */
    #pattern;

    constructor(object) {
        object = Object.fromEntries(Object.entries(object).map(([key, matches]) => [key, Array.from(new Set(
            (Array.isArray(matches) ? matches : [matches])
                .map(m => (Array.isArray(m) ? m : [m]).map(m => Array.isArray(m) ? m : [m]))
                .flatMap(m => m.reduce((a, b) => a.flatMap((c) => b.map((d) => c + d))))
        )).sort()]).sort((a, b) => a[0].compare(b[0])));

        this.#pattern = new RegExp(`^${Object.entries(object).map(([key, matches]) => `(?<${key}>${matches.map(RegExp.escape).join("|")})`).join("|")}$`, "i");

        const matches = Object.values(object).flat();

        if (matches.length !== new Set(matches).size) {
            throw new Error();
        }
    }

    /**
     * @param {string} string
     * @returns {string | undefined}
     */
    match(string) {
        const match = this.#pattern.exec(string);

        if (!match) {
            return;
        }

        for (const key in match.groups) {
            if (match.groups[key]) {
                return key;
            }
        }
    }
}

export function fromFeet(range, units) {
    if (range === null) {
        return null;
    }

    switch (units) {
        case "in": return range / 12;
        case "ft": return range;
        case "yd": return range * 3;
        case "mi": return range * 1760;
        case "mm": return range * 10 / 3000;
        case "cm": return range * 10 / 300;
        case "dm": return range * 10 / 30;
        case "m": return range * 10 / 3;
        case "km": return range * 10000 / 3;
        default: return range;
    }
}

export function toFeet(range, units) {
    if (range === null) {
        return null;
    }

    switch (units) {
        case "in": return range * 12;
        case "ft": return range;
        case "yd": return range / 3;
        case "mi": return range / 1760;
        case "mm": return range * 3000 / 10;
        case "cm": return range * 300 / 10;
        case "dm": return range * 30 / 10;
        case "m": return range * 3 / 10;
        case "km": return range * 3 / 10000;
        default: return range;
    }
}

export function convertUnits(range, fromUnits, toUnits) {
    return toFeet(fromFeet(range, fromUnits), toUnits);
}

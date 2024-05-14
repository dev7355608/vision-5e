export class Matcher {

    /** @type {RegExp} */
    #pattern;

    constructor(object) {
        object = Object.fromEntries(Object.entries(object).map(([key, matches]) => [key, Array.from(new Set(
            (Array.isArray(matches) ? matches : [matches])
                .map(m => (Array.isArray(m) ? m : [m]).map(m => Array.isArray(m) ? m : [m]))
                .flatMap(m => m.reduce((a, b) => a.flatMap((c) => b.map((d) => c + d))))
                .map(s => s.trim().toLowerCase().replace(/\s+/g, " "))
        )).sort()]));

        this.#pattern = new RegExp(`^${Object.entries(object).map(([key, matches]) => `(?<${key}>${matches.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|")})`).join("|")}$`, "i");

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

export function unitsToFeet(range, units) {
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

export function feetToUnits(range, units) {
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

export function convertRange(range, fromUnits, toUnits) {
    return feetToUnits(unitsToFeet(range, fromUnits), toUnits);
}

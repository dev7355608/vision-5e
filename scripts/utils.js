export function getLowerCaseNameSet(dictonary) {
    let names = [];

    for (let [locale, entries] of Object.entries(dictonary)) {
        let localizedNames = [];

        if (!Array.isArray(entries)
            || entries.some((e) => Array.isArray(e) && e.every((s) => typeof s === "string"))) {
            entries = [entries];
        }

        for (const entry of entries) {
            if (typeof entry === "string") {
                localizedNames.push(entry);
            } else {
                localizedNames = localizedNames.concat(entry.map((a) => Array.isArray(a) ? a : [a])
                    .reduce((a, b) => a.flatMap((d) => b.map((e) => d + e))));
            }
        }

        names = names.concat(Array.from(new Set(localizedNames
            .map((s) => s.trim().replace(/\s/g, " "))
            .concat(localizedNames.map((s) => s.toLocaleLowerCase(locale)))
            .concat(localizedNames.map((s) => s.toLocaleUpperCase(locale)))
            .map((s) => s.toLowerCase())))
            .sort((a, b) => a.localeCompare(b, locale)));
    }

    return new Set(names);
}

export function createNameRegExp(dictonary, exact = true) {
    const names = Array.from(getLowerCaseNameSet(dictonary)).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    return new RegExp(`${exact ? "^" : "\\b"}(?:${names.join("|")})${exact ? "$" : "\\b"}`, "i");
}

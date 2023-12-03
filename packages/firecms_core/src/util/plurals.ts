/**
 * Returns the plural of an English word.
 *
 * @export
 * @param {string} word
 * @param {number} [amount]
 * @returns {string}
 */
export function plural(word: string, amount?: number): string {
    if (amount !== undefined && amount === 1) {
        return word
    }
    const plurals: { [key: string]: string } = {
        "(quiz)$": "$1zes",
        "^(ox)$": "$1en",
        "([m|l])ouse$": "$1ice",
        "(matr|vert|ind)ix|ex$": "$1ices",
        "(x|ch|ss|sh)$": "$1es",
        "([^aeiouy]|qu)y$": "$1ies",
        "(hive)$": "$1s",
        "(?:([^f])fe|([lr])f)$": "$1$2ves",
        "(shea|lea|loa|thie)f$": "$1ves",
        sis$: "ses",
        "([ti])um$": "$1a",
        "(tomat|potat|ech|her|vet)o$": "$1oes",
        "(bu)s$": "$1ses",
        "(alias)$": "$1es",
        "(octop)us$": "$1i",
        "(ax|test)is$": "$1es",
        "(us)$": "$1es",
        "([^s]+)$": "$1s"
    }
    const irregular: { [key: string]: string } = {
        move: "moves",
        foot: "feet",
        goose: "geese",
        sex: "sexes",
        child: "children",
        man: "men",
        tooth: "teeth",
        person: "people"
    }
    const uncountable: string[] = [
        "sheep",
        "fish",
        "deer",
        "moose",
        "series",
        "species",
        "money",
        "rice",
        "information",
        "equipment",
        "bison",
        "cod",
        "offspring",
        "pike",
        "salmon",
        "shrimp",
        "swine",
        "trout",
        "aircraft",
        "hovercraft",
        "spacecraft",
        "sugar",
        "tuna",
        "you",
        "wood"
    ]
    // save some time in the case that singular and plural are the same
    if (uncountable.indexOf(word.toLowerCase()) >= 0) {
        return word;
    }
    // check for irregular forms
    for (const w in irregular) {
        const pattern = new RegExp(`${w}$`, "i")
        const replace = irregular[w]
        if (pattern.test(word)) {
            return word.replace(pattern, replace);
        }
    }
    // check for matches using regular expressions
    for (const reg in plurals) {
        const pattern = new RegExp(reg, "i")
        if (pattern.test(word)) {
            return word.replace(pattern, plurals[reg])
        }
    }
    return word;
}

/**
 * Returns the singular of an English word.
 *
 * @export
 * @param {string} word
 * @param {number} [amount]
 * @returns {string}
 */
export function singular(word: string, amount?: number): string {
    if (amount !== undefined && amount !== 1) {
        return word;
    }
    const singulars: { [key: string]: string } = {
        "(quiz)zes$": "$1",
        "(matr)ices$": "$1ix",
        "(vert|ind)ices$": "$1ex",
        "^(ox)en$": "$1",
        "(alias)es$": "$1",
        "(octop|vir)i$": "$1us",
        "(cris|ax|test)es$": "$1is",
        "(shoe)s$": "$1",
        "(o)es$": "$1",
        "(bus)es$": "$1",
        "([m|l])ice$": "$1ouse",
        "(x|ch|ss|sh)es$": "$1",
        "(m)ovies$": "$1ovie",
        "(s)eries$": "$1eries",
        "([^aeiouy]|qu)ies$": "$1y",
        "([lr])ves$": "$1f",
        "(tive)s$": "$1",
        "(hive)s$": "$1",
        "(li|wi|kni)ves$": "$1fe",
        "(shea|loa|lea|thie)ves$": "$1f",
        "(^analy)ses$": "$1sis",
        "((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$": "$1$2sis",
        "([ti])a$": "$1um",
        "(n)ews$": "$1ews",
        "(h|bl)ouses$": "$1ouse",
        "(corpse)s$": "$1",
        "(us)es$": "$1",
        s$: ""
    }
    const irregular: { [key: string]: string } = {
        move: "moves",
        foot: "feet",
        goose: "geese",
        sex: "sexes",
        child: "children",
        man: "men",
        tooth: "teeth",
        person: "people"
    }
    const uncountable: string[] = [
        "sheep",
        "fish",
        "deer",
        "moose",
        "series",
        "species",
        "money",
        "rice",
        "information",
        "equipment",
        "bison",
        "cod",
        "offspring",
        "pike",
        "salmon",
        "shrimp",
        "swine",
        "trout",
        "aircraft",
        "hovercraft",
        "spacecraft",
        "sugar",
        "tuna",
        "you",
        "wood"
    ]
    // save some time in the case that singular and plural are the same
    if (uncountable.indexOf(word.toLowerCase()) >= 0) {
        return word;
    }
    // check for irregular forms
    for (const w in irregular) {
        const pattern = new RegExp(`${irregular[w]}$`, "i");
        if (pattern.test(word)) {
            return word.replace(pattern, w);
        }
    }
    // check for matches using regular expressions
    for (const reg in singulars) {
        const pattern = new RegExp(reg, "i");
        if (pattern.test(word)) {
            return word.replace(pattern, singulars[reg]);
        }
    }
    return word;
}

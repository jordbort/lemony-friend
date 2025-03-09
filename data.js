const lemonyFresh = JSON.parse(process.env.LEMONY_FRESH)
const mods = JSON.parse(process.env.MOD_DATA)
const users = JSON.parse(process.env.USER_DATA)
const knownTags = JSON.parse(process.env.KNOWN_TAGS)
const lemCmds = JSON.parse(process.env.LEMON_COMMANDS)

const wordBank = {
    nouns: JSON.parse(process.env.WORDBANK_NOUNS),
    verbs: JSON.parse(process.env.WORDBANK_VERBS),
    adjectives: JSON.parse(process.env.WORDBANK_ADJECTIVES)
}

module.exports = {
    lemonyFresh,
    mods,
    users,
    knownTags,
    lemCmds,
    wordBank
}

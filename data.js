const lemonyFresh = JSON.parse(process.env.LEMONY_FRESH)
const mods = JSON.parse(process.env.MOD_DATA)
const users = JSON.parse(process.env.USER_DATA)
const knownTags = JSON.parse(process.env.KNOWN_TAGS)
const lemCmds = JSON.parse(process.env.LEMON_COMMANDS)

const COMMON_NICKNAMES = process.env.COMMON_NICKNAMES
const commonNicknames = {}
for (let arr = COMMON_NICKNAMES.split(`,`), i = 0; i < arr.length; i++) { if (i % 2 === 0) { commonNicknames[arr[i]] = arr[i + 1] } }

const STARTING_LEMONS = process.env.STARTING_LEMONS
const startingLemons = {}
for (let arr = STARTING_LEMONS.split(`,`), i = 0; i < arr.length; i++) { if (i % 2 === 0) { startingLemons[arr[i]] = Number(arr[i + 1]) } }

const HANGMAN_WINS = process.env.HANGMAN_WINS
const hangmanWins = {}
for (let arr = HANGMAN_WINS.split(`,`), i = 0; i < arr.length; i++) { if (i % 2 === 0) { hangmanWins[arr[i]] = Number(arr[i + 1]) } }

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
    commonNicknames,
    startingLemons,
    hangmanWins,
    wordBank
}

function getMemory(str) {
    let path
    try { path = require.resolve(`./memory.json`) }
    catch (err) { return null }
    return require(path)[str]
}

// Initialize memory
const joinedChatrooms = getMemory(`joinedChatrooms`) || []
const settings = getMemory(`settings`) || {}
const lemonyFresh = getMemory(`lemonyFresh`) || {}
const mods = getMemory(`mods`) || {}
const users = getMemory(`users`) || {}
const knownTags = getMemory(`knownTags`) || {}
const lemCmds = getMemory(`lemCmds`) || {}
const wordBank = getMemory(`wordBank`) || {}

// Set default values, if not set
settings.botAccessToken = settings.botAccessToken || ""
settings.conduitId = settings.conduitId || ""
settings.botMood = settings.botMood || "happy"
settings.chantEmote = settings.chantEmote || "👏️"
settings.joinMessage = settings.joinMessage || ""
settings.timeLocale = settings.timeLocale || "en-US"
settings.timeZone = settings.timeZone || "America/New_York"
settings.startDate = new Date()
settings.currentDate = new Date().toLocaleDateString(settings.timeLocale, { year: `numeric`, month: `long`, day: `numeric`, timeZone: settings.timeZone })
settings.usedPokeball = settings.usedPokeball || ""
settings.firstConnection = true
settings.debug = settings.debug || true
settings.hideNonDevChannel = settings.hideNonDevChannel || false
settings.highlightBotMessage = settings.highlightBotMessage || true
settings.logTime = settings.logTime || true
settings.playPCG = settings.playPCG || true
settings.realRPS = settings.realRPS || true
settings.sayJoinMessage = settings.sayJoinMessage || true
settings.sayPartMessage = settings.sayPartMessage || true
settings.chantCount = settings.chantCount || 8
settings.funNumberCount = settings.funNumberCount || 75
settings.funNumberTotal = settings.funNumberTotal || 75
settings.funTimerDuration = settings.funTimerDuration || 1800000
settings.hangmanChances = settings.hangmanChances || 6
settings.hangmanLemonThreshold = settings.hangmanLemonThreshold || 2
settings.hangmanSignupSeconds = settings.hangmanSignupSeconds || 30
settings.lemonLeaderCount = settings.lemonLeaderCount || 5
settings.maxCountdownDuration = settings.maxCountdownDuration || 7200000
settings.maxWelcomeBackMinutes = settings.maxWelcomeBackMinutes || 640
settings.minWelcomeBackMinutes = settings.minWelcomeBackMinutes || 120
settings.pokeballQuantity = settings.pokeballQuantity || 10
settings.autoBan = settings.autoBan || []

settings.baseEmotes = settings.baseEmotes || {}
settings.baseEmotes.lemonEmotes = settings.baseEmotes.lemonEmotes || [`🍋️`]
settings.baseEmotes.neutralEmotes = settings.baseEmotes.neutralEmotes || [`:)`]
settings.baseEmotes.hypeEmotes = settings.baseEmotes.hypeEmotes || [`:D`]
settings.baseEmotes.positiveEmotes = settings.baseEmotes.positiveEmotes || [`:)`]
settings.baseEmotes.upsetEmotes = settings.baseEmotes.upsetEmotes || [`>(`, `:(`]
settings.baseEmotes.negativeEmotes = settings.baseEmotes.negativeEmotes || [`:(`, `:O`]
settings.baseEmotes.greetingEmotes = settings.baseEmotes.greetingEmotes || [`HeyGuys`, `<3`, `FishMoley`]
settings.baseEmotes.byeEmotes = settings.baseEmotes.byeEmotes || [`HeyGuys`, `<3`]
settings.baseEmotes.dumbEmotes = settings.baseEmotes.dumbEmotes || [`:p`, `4Head`, `Kappa`]

settings.globalEmotes = settings.globalEmotes || {}
settings.globalEmotes.twitch = settings.globalEmotes.twitch || []
settings.globalEmotes.bttv = settings.globalEmotes.bttv || []

settings.ignoredBots = settings.ignoredBots || []
settings.knownChannels = settings.knownChannels || {}
settings.streakMinutesThreshold = settings.streakMinutesThreshold || 10

wordBank.nouns = wordBank.nouns || []
wordBank.verbs = wordBank.verbs || []
wordBank.adjectives = wordBank.adjectives || []

module.exports = {
    joinedChatrooms,
    settings,
    lemonyFresh,
    mods,
    users,
    knownTags,
    lemCmds,
    wordBank
}

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
settings.botAccessToken = settings.botAccessToken || ``
settings.conduitId = settings.conduitId || ``
settings.botMood = settings.botMood || `happy`
settings.chantEmote = settings.chantEmote || `👏️`
settings.joinMessage = settings.joinMessage || ``
settings.timeLocale = settings.timeLocale || `en-US`
settings.timeZone = settings.timeZone || `America/New_York`
settings.startDate = new Date()
settings.currentDate = new Date().toLocaleDateString(settings.timeLocale, { year: `numeric`, month: `long`, day: `numeric`, timeZone: settings.timeZone })
settings.usedPokeball = settings.usedPokeball || ``
settings.firstConnection = true
settings.debug = settings.debug === undefined ? true : settings.debug
settings.reportWebSocketActivity = settings.reportWebSocketActivity === undefined ? true : settings.reportWebSocketActivity
settings.hideNonDevChannel = settings.hideNonDevChannel === undefined ? false : settings.hideNonDevChannel
settings.highlightBotMessage = settings.highlightBotMessage === undefined ? true : settings.highlightBotMessage
settings.logTime = settings.logTime === undefined ? true : settings.logTime
settings.playPCG = settings.playPCG === undefined ? true : settings.playPCG
settings.realRPS = settings.realRPS === undefined ? true : settings.realRPS
settings.sayJoinMessage = settings.sayJoinMessage === undefined ? true : settings.sayJoinMessage
settings.sayPartMessage = settings.sayPartMessage === undefined ? true : settings.sayPartMessage
settings.chantCount = settings.chantCount === undefined ? 8 : settings.chantCount
settings.funNumberCount = settings.funNumberCount === undefined ? 75 : settings.funNumberCount
settings.funNumberTotal = settings.funNumberTotal === undefined ? 75 : settings.funNumberTotal
settings.funTimerDuration = settings.funTimerDuration === undefined ? 1800000 : settings.funTimerDuration
settings.hangmanChances = settings.hangmanChances === undefined ? 6 : settings.hangmanChances
settings.hangmanLemonThreshold = settings.hangmanLemonThreshold === undefined ? 2 : settings.hangmanLemonThreshold
settings.hangmanSignupSeconds = settings.hangmanSignupSeconds === undefined ? 30 : settings.hangmanSignupSeconds
settings.lemonLeaderCount = settings.lemonLeaderCount === undefined ? 5 : settings.lemonLeaderCount
settings.maxCountdownDuration = settings.maxCountdownDuration === undefined ? 7200000 : settings.maxCountdownDuration
settings.maxWelcomeBackMinutes = settings.maxWelcomeBackMinutes === undefined ? 640 : settings.maxWelcomeBackMinutes
settings.minWelcomeBackMinutes = settings.minWelcomeBackMinutes === undefined ? 120 : settings.minWelcomeBackMinutes
settings.pokeballQuantity = settings.pokeballQuantity === undefined ? 10 : settings.pokeballQuantity
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
settings.streakMinutesThreshold = settings.streakMinutesThreshold === undefined ? 10 : settings.streakMinutesThreshold

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

const { joinedChatrooms, settings, lemonyFresh, mods, users, knownTags, lemCmds, wordBank,
    commonNicknames, startingLemons, hangmanWins // unclaimed legacy memory tables
} = require(`./memory.json`)

settings.firstConnection = true
settings.startDate = new Date()
settings.currentDate = new Date().toLocaleDateString(settings.timeLocale, { year: `numeric`, month: `long`, day: `numeric`, timeZone: settings.timeZone })

module.exports = {
    joinedChatrooms,
    settings,
    lemonyFresh,
    mods,
    users,
    knownTags,
    lemCmds,
    wordBank,
    commonNicknames,
    startingLemons,
    hangmanWins
}

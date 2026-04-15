const DEV = process.env.DEV

const { lemCmds } = require(`../data`)
const { getMemoryUsage, logMessage } = require(`../utils`)

const useList = require(`./list`)
const useCount = require(`./count`)
const useConvert = require(`./convert`)
const rockPaperScissors = require(`./rps`)
const useCountdown = require(`./countdown`)
const useLemonRank = require(`./lemonRank`)

const { getTime } = require(`./time`)
const { getSubs } = require(`./help`)
const { handleLemonify } = require(`./lemonify`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { handleLemCmd, getLemCmds } = require(`./lemCmds`)
const { getDocs, getStats, accessInstructions } = require(`./help`)
const { manageHangman, joinHangman } = require(`../patterns/hangman`)
const { insultUser, manageVerbs, manageNouns, manageAdjectives } = require(`./insult`)
const { getLastMessage, getMessageCount, sayOnlineTime, sayFriends, getColor, getLemons } = require(`./getInfo`)
const { getDadJoke, getPokemon, getDefinition, getPokemonAbility, getUrbanDictionaryDefinition } = require(`./external`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell, makeMultiTwitchLink, tiny, huge, makeCursive } = require(`./conversation`)
const { handleShoutout, getBotToken, makeAnnouncement, authorizeToken, banUsers, startPoll, endPoll, updateStreamGame, updateStreamTitle, checkToken } = require(`./twitch`)
const { createConduit, getConduit, updateConduitShardCount, deleteConduit, getConduitShards, logJoinedChatrooms, getEventSubs, connectWebSocket, disconnectWebSocket, refreshEventSubs, shutdown, writeMemoryFile, kms, logChannelInfo, logUserInfo, logModInfo, logChannelViewers, logTags, logSettings, logBotChannels, yellAcrossChannels, streamFriendlyOn, streamFriendlyOff, testFunNumber, checkPoints } = require(`./dev`)

const commands = {
    '!so': handleShoutout,
    '!token': getBotToken,
    '!checktoken': checkToken,

    '!announce': makeAnnouncement,
    '!announceblue': makeAnnouncement,
    '!announcegreen': makeAnnouncement,
    '!announceorange': makeAnnouncement,
    '!announcepurple': makeAnnouncement,

    '!setgame': updateStreamGame,
    // '!game': updateStreamGame,
    '!settitle': updateStreamTitle,
    // '!title': updateStreamTitle,

    '!poll': startPoll,
    '!endpoll': endPoll,
    '!cancelpoll': endPoll,
    '!stoppoll': endPoll,

    '!access': accessInstructions,
    '!authorize': authorizeToken,

    '!banuser': banUsers,
    '!banusers': banUsers,

    '!count': useCount,
    '!list': useList,

    '!convert': useConvert,

    '!time': getTime,

    '!countdown': useCountdown,
    '!timer': useCountdown,

    '!rps': rockPaperScissors,

    '!lemonify': handleLemonify,

    '!small': tiny,
    '!tiny': tiny,
    '!big': huge,
    '!huge': huge,
    '!cursive': makeCursive,

    '!lemoncommand': handleLemCmd,
    '!lemcmd': handleLemCmd,

    '!lemoncommands': getLemCmds,
    '!lemcmds': getLemCmds,

    '!docs': getDocs,
    '!mystats': getStats,

    '!hangman': manageHangman,
    '!play': joinHangman,

    '!lastmsg': getLastMessage,
    '!msgcount': getMessageCount,

    '!insult': insultUser,

    '!verbs': manageVerbs,
    '!verb': manageVerbs,
    '!v': manageVerbs,

    '!nouns': manageNouns,
    '!noun': manageNouns,
    '!n': manageNouns,

    '!adjectives': manageAdjectives,
    '!adjective': manageAdjectives,
    '!adj': manageAdjectives,
    '!a': manageAdjectives,

    '!chant': chant,
    '!yell': yell,
    '!greet': handleGreet,
    '!raid': handleRaid,

    '!gn': sayGoodnight,
    '!goodnight': sayGoodnight,
    '!bye': sayGoodnight,
    '!goodbye': sayGoodnight,

    '!color': getColor,
    '!colour': getColor,

    '!lemon': getLemons,
    '!lemons': getLemons,

    '!lemonboard': useLemonRank,
    '!lemonrank': useLemonRank,

    '!friend': sayFriends,
    '!friends': sayFriends,

    '!online': sayOnlineTime,
    '!onl': sayOnlineTime,

    '!lurk': setAway,
    '!away': setAway,
    '!brb': setAway,

    '!multitwitch': makeMultiTwitchLink,

    '!dadjoke': getDadJoke,

    '!pokemon': getPokemon,
    '!ability': getPokemonAbility,

    '!define': getDefinition,
    '!definition': getDefinition,
    '!meaning': getDefinition,

    '!ud': getUrbanDictionaryDefinition,

    '!usage': getMemoryUsage
}

const devCommands = {
    // For conduits
    'createconduit': createConduit,
    'getconduit': getConduit,
    'shardcount': updateConduitShardCount,
    'deleteconduit': deleteConduit,
    'getshards': getConduitShards,
    'joined': logJoinedChatrooms,

    // For WebSockets
    'getsubs': getEventSubs,
    'openws': connectWebSocket,
    'closews': disconnectWebSocket,
    'updatesubs': refreshEventSubs,

    // For saving memory file
    '_shutdown': shutdown,
    '_print': writeMemoryFile,
    '_crash': kms,

    // For individual data
    'channel': logChannelInfo,
    'user': logUserInfo,
    'mod': logModInfo,
    'viewers': logChannelViewers,
    'tags': logTags,
    'settings': logSettings,
    'channels': logBotChannels,

    // For messaging across all channels
    '!broadcast': yellAcrossChannels,

    // For stream-friendly log view
    '!streamon': streamFriendlyOn,
    '!streamoff': streamFriendlyOff,

    // For testing funCumber outcomes
    'test': testFunNumber,

    'sepoints': checkPoints,
    '!subs': getSubs,
    '!join': handleJoin,
    '!part': handlePart
}

module.exports = function useCommand(props) {
    const { message, username, command } = props
    if (message.startsWith(`!`)) {
        if (command in commands) {
            logMessage([`MATCHED COMMAND:`, command, `[Function: ${commands[command].name}]`])
            commands[command](props)
            return true
        } else if (!/.+lemon/i.test(command) && !(command in lemCmds) && !(command in devCommands)) {
            logMessage([`COMMAND NOT RECOGNIZED`])
        }
    }

    if (username === DEV && command in devCommands) {
        logMessage([`MATCHED DEV COMMAND:`, command, `[Function: ${devCommands[command].name}]`])
        devCommands[command](props)
        return true
    }

    return false
}

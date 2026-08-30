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
const { getDocs, accessInstructions } = require(`./help`)
const { manageHangman, joinHangman } = require(`../patterns/hangman`)
const { playBlackjack, hit, split, doubleDown, stay } = require(`./blackjack`)
const { insultUser, manageVerbs, manageNouns, manageAdjectives } = require(`./insult`)
const { getLastMessage, getMessageCount, sayOnlineTime, sayFriends, getColor, getLemons } = require(`./getInfo`)
const { getDadJoke, getPokemon, getDefinition, getPokemonAbility, getUrbanDictionaryDefinition } = require(`./external`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell, makeMultiTwitchLink, tiny, bold, cursive, doubleStruck } = require(`./conversation`)
const { handleShoutout, getBotToken, makeAnnouncement, authorizeToken, banUsers, startPoll, endPoll, updateStreamGame, updateStreamTitle, checkToken, getFollowDuration } = require(`./twitch`)
const {
    createConduit, getConduit, updateConduitShardCount, deleteConduit, getConduitShards, logJoinedChatrooms,
    getEventSubs, refreshEventSubs, connectWebSocket, disconnectWebSocket,
    logChannelInfo, logChannelViewers, logModInfo, logUserInfo, logSettings, logTags, logUsersInChannel,
    yellAcrossChannels,
    writeMemoryFile, shutdown, kms,
    streamFriendlyOn, streamFriendlyOff,
    testFunNumber,
    countEmptyUsers, deleteEmptyUsers, collectUserData,
    redrawHUD, setOnline, setOffline,
    checkPoints
} = require(`./dev`)

const commands = {
    '!so': handleShoutout,
    '!shoutout': handleShoutout,

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
    '!bold': bold,
    '!big': bold,
    '!huge': bold,
    '!cursive': cursive,
    '!doublestruck': doubleStruck,

    '!lemoncommand': handleLemCmd,
    '!lemcmd': handleLemCmd,

    '!lemoncommands': getLemCmds,
    '!lemcmds': getLemCmds,

    '!docs': getDocs,

    '!hangman': manageHangman,
    '!play': joinHangman,

    '!blackjack': playBlackjack,
    '!bj': playBlackjack,
    '!hit': hit,
    '!hitme': hit,
    '!split': split,
    '!doubledown': doubleDown,
    '!dd': doubleDown,
    '!stay': stay,
    '!stand': stay,

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
    '!toplemons': useLemonRank,

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

    '!usage': getMemoryUsage,

    '!followage': getFollowDuration
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
    'updatesubs': refreshEventSubs,
    'openws': connectWebSocket,
    'closews': disconnectWebSocket,

    // For individual data
    'channel': logChannelInfo,
    'viewers': logChannelViewers,
    'mod': logModInfo,
    'user': logUserInfo,
    'settings': logSettings,
    'tags': logTags,
    'users': logUsersInChannel,

    // For messaging across all channels
    '!broadcast': yellAcrossChannels,

    // For saving memory file
    '_print': writeMemoryFile,
    '_shutdown': shutdown,
    '_crash': kms,

    // For stream-friendly log view
    '!streamon': streamFriendlyOn,
    '!streamoff': streamFriendlyOff,

    // For testing funCumber outcomes
    'test': testFunNumber,

    // For data management
    '!empty': countEmptyUsers,
    '!cleanup': deleteEmptyUsers,
    'chart': collectUserData,

    // For updating the HUD
    'redraw': redrawHUD,
    'online': setOnline,
    'offline': setOffline,

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

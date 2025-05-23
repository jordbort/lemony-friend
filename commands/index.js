const { getTime } = require(`./time`)
const { useList } = require(`./list`)
const { useCount } = require(`./count`)
const { convert } = require(`./convert`)
const { countdown } = require(`./countdown`)
const { getMemoryUsage } = require(`../utils`)
const { rockPaperScissors } = require(`./rps`)
const { getDocs, getStats } = require(`./help`)
const { lemonRank } = require(`./lemonRank`)
const { handleLemonify } = require(`./lemonify`)
const { makeMultiTwitchLink } = require(`./multitwitch`)
const { handleLemCmd, getLemCmds } = require(`./lemCmds`)
const { manageHangman, joinHangman } = require(`../patterns/hangman`)
const { insultUser, manageVerbs, manageNouns, manageAdjectives } = require(`./insult`)
const { getDadJoke, getPokemon, getDefinition, getPokemonAbility } = require(`./external`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell } = require(`./conversation`)
const { getLastMessage, getMessageCount, sayOnlineTime, sayFriends, getColor, getLemons } = require(`./getInfo`)
const { handleShoutOut, getBotToken, validateToken, refreshToken, makeAnnouncement, pollStart, pollEnd, getOAUTHToken, authorizeToken, banUsers } = require(`./twitch`)

module.exports = {
    '!so': handleShoutOut,
    '!token': getBotToken,
    '!validate': validateToken,
    '!refresh': refreshToken,

    '!announce': makeAnnouncement,
    '!announceblue': makeAnnouncement,
    '!announcegreen': makeAnnouncement,
    '!announceorange': makeAnnouncement,
    '!announcepurple': makeAnnouncement,

    '!poll': pollStart,
    '!endpoll': pollEnd,
    '!cancelpoll': pollEnd,
    '!stoppoll': pollEnd,

    '!access': getOAUTHToken,
    '!authorize': authorizeToken,

    '!banuser': banUsers,
    '!banusers': banUsers,

    '!count': useCount,
    '!list': useList,

    '!convert': convert,

    '!time': getTime,

    '!countdown': countdown,
    '!timer': countdown,

    '!rps': rockPaperScissors,

    '!lemonify': handleLemonify,

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

    '!lemonboard': lemonRank,
    '!lemonrank': lemonRank,

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

    '!usage': getMemoryUsage
}

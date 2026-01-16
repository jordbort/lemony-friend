const { getTime } = require(`./time`)
const { useList } = require(`./list`)
const { useCount } = require(`./count`)
const { convert } = require(`./convert`)
const { lemonRank } = require(`./lemonRank`)
const { countdown } = require(`./countdown`)
const { getMemoryUsage } = require(`../utils`)
const { rockPaperScissors } = require(`./rps`)
const { getDocs, getStats } = require(`./help`)
const { handleLemonify } = require(`./lemonify`)
const { makeMultiTwitchLink } = require(`./multitwitch`)
const { handleLemCmd, getLemCmds } = require(`./lemCmds`)
const { manageHangman, joinHangman } = require(`../patterns/hangman`)
const { insultUser, manageVerbs, manageNouns, manageAdjectives } = require(`./insult`)
const { getLastMessage, getMessageCount, sayOnlineTime, sayFriends, getColor, getLemons } = require(`./getInfo`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell, tiny, makeCursive } = require(`./conversation`)
const { getDadJoke, getPokemon, getDefinition, getPokemonAbility, getUrbanDictionaryDefinition } = require(`./external`)
const { handleShoutout, getBotToken, makeAnnouncement, accessInstructions, authorizeToken, banUsers, startPoll, endPoll, updateStreamGame, updateStreamTitle, checkToken } = require(`./twitch`)

module.exports = {
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

    '!convert': convert,

    '!time': getTime,

    '!countdown': countdown,
    '!timer': countdown,

    '!rps': rockPaperScissors,

    '!lemonify': handleLemonify,

    '!tiny': tiny,
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

    '!ud': getUrbanDictionaryDefinition,

    '!usage': getMemoryUsage
}

const { getTime } = require(`./time`)
const { sayGoals } = require(`./sayGoals`)
const { applyNicknames } = require(`../utils`)
const { rockPaperScissors } = require(`./rps`)
const { handleLemonify } = require(`./lemonify`)
const { getTempCmds, handleTempCmd } = require(`./tempCmds`)
const { sayCommands, getDocs, getStats } = require(`./help`)
const { startHangman, joinHangman } = require(`../patterns/hangman`)
const { getDadJoke, getPokemon, getDefinition } = require(`./external`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell } = require(`./conversation`)
const { getLastMessage, getMessageCount, getColor, getLemons, sayOnlineTime, sayFriends } = require(`./getInfo`)
const { handleShoutOut, getBotToken, validateToken, refreshToken, makeAnnouncement, pollStart, pollEnd, getOAUTHToken, authorizeToken } = require(`./twitch`)

module.exports = {
    '!docs': getDocs,
    '!commands': sayCommands,
    '!apply': applyNicknames,
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
    '!time': getTime,
    '!chant': chant,
    '!hangman': startHangman,
    '!play': joinHangman,

    '!raid': handleRaid,
    '!rps': rockPaperScissors,
    '!mystats': getStats,
    '!lastmsg': getLastMessage,
    '!msgcount': getMessageCount,
    '!yell': yell,
    '!lemonify': handleLemonify,
    '!greet': handleGreet,
    '!dadjoke': getDadJoke,
    '!pokemon': getPokemon,

    '!define': getDefinition,
    '!definition': getDefinition,
    '!meaning': getDefinition,

    '!friend': sayFriends,
    '!friends': sayFriends,

    '!lemon': getLemons,
    '!lemons': getLemons,

    '!goal': sayGoals,
    '!goals': sayGoals,

    '!gn': sayGoodnight,
    '!goodnight': sayGoodnight,
    '!bye': sayGoodnight,

    '!color': getColor,
    '!colour': getColor,

    '!lurk': setAway,
    '!away': setAway,
    '!brb': setAway,

    '!tempcmd': handleTempCmd,
    '!tmpcmd': handleTempCmd,

    '!tempcmds': getTempCmds,
    '!tmpcmds': getTempCmds,

    '!online': sayOnlineTime,
    '!onl': sayOnlineTime,
}

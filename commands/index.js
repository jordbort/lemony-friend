const { getTime } = require(`./time`)
const { sayGoals } = require(`./sayGoals`)
const { applyNicknames } = require(`../utils`)
const { rockPaperScissors } = require(`./rps`)
const { handleLemonify } = require(`./lemonify`)
const { handleTempCmd, getTempCmds } = require(`./tempCmds`)
const { sayCommands, getDocs, getStats } = require(`./help`)
const { startHangman, joinHangman } = require(`../patterns/hangman`)
const { getDadJoke, getPokemon, getDefinition } = require(`./external`)
const { sayGoodnight, handleGreet, chant, handleRaid, setAway, yell } = require(`./conversation`)
const { getLastMessage, getMessageCount, sayOnlineTime, sayFriends, getColor, getLemons } = require(`./getInfo`)
const { handleShoutOut, getBotToken, validateToken, refreshToken, makeAnnouncement, pollStart, pollEnd, getOAUTHToken, authorizeToken } = require(`./twitch`)

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

    '!time': getTime,

    '!goal': sayGoals,
    '!goals': sayGoals,

    '!apply': applyNicknames,

    '!rps': rockPaperScissors,

    '!lemonify': handleLemonify,

    '!tempcmd': handleTempCmd,
    '!tmpcmd': handleTempCmd,

    '!tempcmds': getTempCmds,
    '!tmpcmds': getTempCmds,

    '!commands': sayCommands,
    '!docs': getDocs,
    '!mystats': getStats,

    '!hangman': startHangman,
    '!play': joinHangman,

    '!lastmsg': getLastMessage,
    '!msgcount': getMessageCount,

    '!chant': chant,
    '!yell': yell,
    '!greet': handleGreet,
    '!raid': handleRaid,

    '!gn': sayGoodnight,
    '!goodnight': sayGoodnight,
    '!bye': sayGoodnight,

    '!color': getColor,
    '!colour': getColor,

    '!lemon': getLemons,
    '!lemons': getLemons,

    '!friend': sayFriends,
    '!friends': sayFriends,

    '!online': sayOnlineTime,
    '!onl': sayOnlineTime,

    '!lurk': setAway,
    '!away': setAway,
    '!brb': setAway,

    '!dadjoke': getDadJoke,
    '!pokemon': getPokemon,

    '!define': getDefinition,
    '!definition': getDefinition,
    '!meaning': getDefinition,
}

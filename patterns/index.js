const { settings, grayTxt, resetTxt } = require("../config")
const { sayButt } = require(`./sayButt`)
const { useLemon } = require(`./useLemon`)
const { commandLemonInterface } = require(`./cli`)
const { checkSelfSub, checkSelfMod, checkSelfVIP, checkEmotes, checkTargetSub, checkTargetMod, checkTargetVIP } = require(`./checkChannelInfo`)

function catchPokemon(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> catchPokemon(channel: '${channel}')${resetTxt}`) }

    bot.say(chatroom, `!pokecatch`)
}

module.exports = {
    [/^cli ?\b/i]: commandLemonInterface,

    [/^!([a-z]+)lemon([a-z]*)/i]: useLemon,

    [/\bbut([a-s|u-z]+)\b/i]: sayButt,

    [/Catch it using !pokecatch \(winners revealed in 90s\)/i]: catchPokemon,
    [/Purchase successful!/i]: catchPokemon,

    [/how many emotes does (@?[a-z0-9_]+) have/i]: checkEmotes,

    [/do i (have a )?sub[\w]*( (to|in) )?/i]: checkSelfSub,
    [/am i (a )?sub[\w]*( (to|in) )?/i]: checkSelfSub,

    [/does (@?[a-z0-9_]+) (have a )?sub[\w]*( (to|in) )?/i]: checkTargetSub,
    [/is (@?[a-z0-9_]+) (a )?sub[\w]*( (to|in) )?/i]: checkTargetSub,


    [/do i (have )?mod[\w]*( (for|in) )?/i]: checkSelfMod,
    [/am i (a )?mod[\w]*( (for|in) )?/i]: checkSelfMod,

    [/does (@?[a-z0-9_]+) (have a )?mod[\w]*( (for|in) )?/i]: checkTargetMod,
    [/is (@?[a-z0-9_]+) (a )?mod[\w]*( (for|in) )?/i]: checkTargetMod,


    [/do i (have )?vip[\w]*( (to|in) )?/i]: checkSelfVIP,
    [/am i (a )?vip[\w]*( (to|in) )?/i]: checkSelfVIP,

    [/does (@?[a-z0-9_]+) (have )?vip[\w]*( (to|in) )?/i]: checkTargetVIP,
    [/is (@?[a-z0-9_]+) (a )?vip[\w]*( (to|in) )?/i]: checkTargetVIP,
}

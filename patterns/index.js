const { sayButt } = require(`./sayButt`)
const { useLemon } = require(`./useLemon`)
const { catchPokemon } = require(`./pokemon`)
const { commandLemonInterface } = require(`./cli`)
const { hypeReact } = require(`../commands/conversation`)
const { checkSelfSub, checkSelfMod, checkSelfVIP, checkEmotes, checkTargetSub, checkTargetMod, checkTargetVIP } = require(`./checkChannelInfo`)

module.exports = {
    [/^cli ?\b/i]: commandLemonInterface,

    [/^!([a-z]+)lemon([a-z]*)/i]: useLemon,

    [/^good bot$/i]: hypeReact,

    [/\bbut([a-s|u-z]+)\b/i]: sayButt,

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

    // From PokemonCommunityGame
    [/Catch it using !pokecatch \(winners revealed in 90s\)/i]: catchPokemon
}

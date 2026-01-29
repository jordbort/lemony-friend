const API_KEY = process.env.API_KEY

const { settings } = require(`../config`)
const { lemonyFresh } = require(`../data`)

const { getContextEmote, renderObj, logMessage, pluralize } = require(`../utils`)

async function apiGetGlobalBttvEmotes() {
    await logMessage([`> apiGetGlobalBttvEmotes()`])

    try {
        const endpoint = `https://api.betterttv.net/3/cached/emotes/global`
        const response = await fetch(endpoint)
        const data = await response.json()
        if (response.status !== 200) {
            await logMessage([`apiGetGlobalBttvEmotes`, response.status, renderObj(data, `data`)])
            return null
        }
        return data
    } catch (err) {
        logMessage([`apiGetGlobalBttvEmotes ${err}`])
    }
}

async function apiGetStreamBttvEmotes(broadcasterId) {
    await logMessage([`> apiGetStreamBttvEmotes(broadcasterId: ${broadcasterId})`])

    try {
        const endpoint = `https://api.betterttv.net/3/cached/users/twitch/${broadcasterId}`
        const response = await fetch(endpoint)
        const data = await response.json()
        if (response.status !== 200) { await logMessage([`apiGetStreamBttvEmotes`, response.status, renderObj(data, `data`)]) }
        return `id` in data
            ? data
            : null
    } catch (err) {
        logMessage([`apiGetStreamBttvEmotes ${err}`])
    }
}

module.exports = {
    async checkSentiment(props) {
        const { bot, chatroom, message } = props
        await logMessage([`> checkSentiment(chatroom: ${chatroom}, message: ${message})`])

        const sanitizedMsg = message.replace(/[\\{`}%^|]/g, ``)
        const endpoint = `https://api.api-ninjas.com/v1/sentiment?text=${sanitizedMsg}`
        const options = {
            headers: {
                'X-Api-Key': API_KEY
            }
        }

        try {
            const response = await fetch(endpoint, options)
            const data = await response.json()
            await logMessage([`checkSentiment`, response.status, renderObj(data, `data`)])

            'sentiment' in data
                ? data.sentiment.includes(`NEUTRAL`)
                    ? bot.say(chatroom, `:p`)
                    : data.sentiment.includes(`POSITIVE`)
                        ? data.sentiment.includes(`WEAK`)
                            ? bot.say(chatroom, `:)`)
                            : bot.say(chatroom, `:D`)
                        : bot.say(chatroom, `:(`)
                : bot.say(chatroom, `:O`)
        } catch (err) {
            logMessage([`checkSentiment ${err}`])
        }
    },
    async getDadJoke(props) {
        const { bot, chatroom, channel } = props
        await logMessage([`> getDadJoke(chatroom: ${chatroom})`])

        try {
            const response = await fetch(`https://icanhazdadjoke.com/`, {
                headers: {
                    accept: `application/json`,
                }
            })
            const data = await response.json()
            await logMessage([`getDadJoke`, response.status, renderObj(data, `data`)])

            const negativeEmote = getContextEmote(`negative`, channel)
            data.status === 200
                ? bot.say(chatroom, data.joke)
                : bot.say(chatroom, `Error getting dad joke! ${negativeEmote}`)
        } catch (err) {
            logMessage([`getDadJoke ${err}`])
        }
    },
    async getDefinition(props) {
        const { bot, chatroom, args, channel } = props
        await logMessage([`> getDefinition(chatroom: ${chatroom}, args:`, args, `)`])
        const str = args.join(` `).replace(/[\\{`}%^|]/g, ``)
        if (!str) {
            bot.say(chatroom, `Please give me a word to define! :)`)
            return
        }

        const endpoint = `https://api.api-ninjas.com/v1/dictionary?word=${str}`
        const options = {
            headers: {
                'X-Api-Key': API_KEY
            }
        }

        try {
            const response = await fetch(endpoint, options)
            const data = await response.json()
            await logMessage([`getDefinition`, response.status, renderObj(data, `data`)])

            const negativeEmote = getContextEmote(`negative`, channel)
            if (`error` in data) {
                bot.say(chatroom, `Error: ${data.error} ${negativeEmote}`)
            } else if (!data.valid || !data.definition) {
                bot.say(chatroom, `I don't think "${data.word}" is a word! ${negativeEmote}`)
            } else {
                let definition = `Definition of "${data.word}": `
                const regex = /\n/g
                const splitDefinition = data.definition.replace(regex, ``).split(`. `).filter(el => el !== `\n`)

                if (!splitDefinition.includes(`1`)) {
                    definition += splitDefinition[0]
                } else {
                    if (splitDefinition.includes(`1`)) { definition += `1) ${splitDefinition[splitDefinition.indexOf(`1`) + 1]}. ` }
                    if (splitDefinition.includes(`2`)) { definition += `2) ${splitDefinition[splitDefinition.indexOf(`2`) + 1]}. ` }
                    if (splitDefinition.includes(`3`)) { definition += `3) ${splitDefinition[splitDefinition.indexOf(`3`) + 1]}. ` }
                }
                bot.say(chatroom, definition)
            }
        } catch (err) {
            logMessage([`getDefinition ${err}`])
        }
    },
    async getPokemon(props) {
        const { bot, chatroom, args, channel } = props
        const pokemon = args
            .join(`-`)
            .toLowerCase()
            .replace(/[\\{`}%^|]/g, ``)
        await logMessage([`> getPokemon(chatroom: ${chatroom}, pokemon: ${pokemon})`])

        if (!pokemon) {
            await logMessage([`-> No Pokemon provided`])
            return
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
            const negativeEmote = getContextEmote(`negative`, channel)
            if (response.status !== 200) {
                await logMessage([`-> ${response.status}: ${response.statusText}`])
                bot.say(chatroom, `Pokémon "${pokemon}" was not found! ${negativeEmote}`)
                return
            }
            const data = await response.json()

            let reply = `#${data.id} ${pokemon.toUpperCase()} `

            const pokemonTypes = []
            for (const types of data.types) { pokemonTypes.push(types.type.name) }
            reply += `(${pokemonTypes.join(`/`)}) - ${data.abilities.length === 1 ? `Ability` : `Abilities`}: `

            const pokemonAbilities = []
            for (const abilities of data.abilities) { pokemonAbilities.push(`${abilities.ability.name}${abilities.is_hidden ? ` (hidden)` : ``}`) }
            reply += `${pokemonAbilities.join(`, `)}. `

            const doubleDamageTo = []
            const doubleDamageFrom = []
            const halfDamageTo = []
            const halfDamageFrom = []
            const immuneTo = []
            const immuneFrom = []

            if (pokemonTypes[0]) {
                try {
                    const response1 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[0]}`)
                    const type1Data = await response1.json()
                    for (const damageType of type1Data.damage_relations.double_damage_to) { if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) } }
                    for (const damageType of type1Data.damage_relations.double_damage_from) { if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) } }
                    for (const damageType of type1Data.damage_relations.half_damage_to) { if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) } }
                    for (const damageType of type1Data.damage_relations.half_damage_from) { if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) } }
                    for (const damageType of type1Data.damage_relations.no_damage_to) { if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) } }
                    for (const damageType of type1Data.damage_relations.no_damage_from) { if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) } }
                } catch (err) {
                    logMessage([`getPokemon type1Data ${err}`])
                }
            }
            if (pokemonTypes[1]) {
                try {
                    const response2 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[1]}`)
                    const type2Data = await response2.json()
                    for (const damageType of type2Data.damage_relations.double_damage_to) { if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) } }
                    for (const damageType of type2Data.damage_relations.double_damage_from) { if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) } }
                    for (const damageType of type2Data.damage_relations.half_damage_to) { if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) } }
                    for (const damageType of type2Data.damage_relations.half_damage_from) { if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) } }
                    for (const damageType of type2Data.damage_relations.no_damage_to) { if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) } }
                    for (const damageType of type2Data.damage_relations.no_damage_from) { if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) } }
                } catch (err) {
                    logMessage([`getPokemon type2Data ${err}`])
                }
            }

            // if it TAKES double damage AND half damage FROM a type, remove from BOTH arrays
            const nullify = doubleDamageFrom.filter(el => halfDamageFrom.includes(el))
            for (const dupe of nullify) {
                doubleDamageFrom.splice(doubleDamageFrom.indexOf(dupe), 1)
                halfDamageFrom.splice(halfDamageFrom.indexOf(dupe), 1)
            }

            // Cleaning up immunities
            for (const type of immuneFrom) {
                if (halfDamageFrom.includes(type)) { halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1) }
                if (doubleDamageFrom.includes(type)) { doubleDamageFrom.splice(doubleDamageFrom.indexOf(type), 1) }
            }

            if (doubleDamageTo.length > 0) { reply += `Super effective to ${doubleDamageTo.join(`/`)}-type Pokemon. ` }
            if (doubleDamageFrom.length > 0) { reply += `Weak to ${doubleDamageFrom.join(`/`)}-type moves. ` }
            if (halfDamageTo.length > 0) { reply += `Not very effective to ${halfDamageTo.join(`/`)}-type Pokemon. ` }
            if (halfDamageFrom.length > 0) { reply += `Resistant to ${halfDamageFrom.join(`/`)}-type moves. ` }
            if (immuneTo.length > 0) { reply += `No effect to ${immuneTo.join(`/`)}-type Pokemon. ` }
            if (immuneFrom.length > 0) { reply += `No effect from ${immuneFrom.join(`/`)}-type moves.` }
            bot.say(chatroom, reply)
        } catch (err) {
            logMessage([`getPokemon ${err}`])
        }
    },
    async getPokemonAbility(props) {
        const { bot, chatroom, args, channel } = props
        const abilityName = args.join(`-`).toLowerCase().replace(/[\\{`}%^|']/g, ``)
        const negativeEmote = getContextEmote(`negative`, channel)

        await logMessage([`> getPokemonAbility(chatroom: ${chatroom}, abilityName: '${abilityName}')`])
        if (!abilityName) {
            await logMessage([`-> No ability provided`])
            return
        }

        // Special cases
        if (abilityName === `as-one`) {
            const message = `Combines Unnerve (Makes the foe nervous and unable to eat Berries) and Chilling Neigh (Boosts Attack after knocking out a Pokémon)/Grim Neigh (Boosts Special Attack after knocking out a Pokémon)`
            bot.say(chatroom, message)
            return
        }
        if (abilityName === `forewarn`) {
            const message = `When this Pokémon enters battle, it reveals the move with the highest base power known by any opposing Pokémon to all participating trainers. In the event of a tie, one is chosen at random. Moves without a listed base power are assigned one as follows: One-hit KO moves (160), Counter moves (120), Variable power or set damage (80), Any such move not listed (0)`
            bot.say(chatroom, message)
            return
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`)
            if (response.status !== 200) {
                await logMessage([`-> ${response.status}: ${response.statusText}`])
                bot.say(chatroom, `Ability "${args.join(` `)}" not found! ${negativeEmote}`)
                return
            }

            const data = await response.json()
            if (data.effect_entries.length) {
                const message = data.effect_entries.filter(el => el.language.name === `en`)[0].effect.replace(/\n+/g, ` `).replace(/ +/g, ` `)
                bot.say(chatroom, message)
            } else {
                await logMessage([`-> No effect entries for`, args.join(` `), data.flavor_text_entries.length, `total flavor text entries`])
                if (data.flavor_text_entries.length) {
                    const message = data.flavor_text_entries.filter(el => el.language.name === `en`)[0].flavor_text.replace(/\n+/g, ` `).replace(/ +/g, ` `)
                    bot.say(chatroom, message)
                }
            }
        } catch (err) {
            logMessage([`getPokemonAbility ${err}`])
        }
    },
    async getUrbanDictionaryDefinition(props) {
        const { bot, chatroom, args, channel } = props
        const query = args.join(` `)
        await logMessage([`> getUrbanDictionaryDefinition(channel: ${channel}, query: '${query}')`])

        if (!query) {
            bot.say(chatroom, `No query provided! :O`)
            return
        }

        try {
            const response = await fetch(`https://unofficialurbandictionaryapi.com/api/search?term=${query}`)
            const data = await response.json()
            await logMessage([`getUrbanDictionaryDefinition`, response.status, renderObj(data, `data`)])

            if (data.statusCode !== 200) {
                bot.say(chatroom, `Error getting definition! :O`)
            }

            const objDefinition = data.data[Math.floor(Math.random() * data.data.length)]
            const reply = data.found
                ? `"${query}" (${pluralize(data.data.length, `definition`, `definitions`)} found): ${objDefinition.meaning} - ex: "${objDefinition.example}" (${objDefinition.date})`
                : `No definition found! :O`

            bot.say(chatroom, reply)
        } catch (err) {
            logMessage([`getUrbanDictionaryDefinition ${err}`])
        }
    },
    async getGlobalBttvEmotes() {
        await logMessage([`> getGlobalBttvEmotes()`])
        const data = await apiGetGlobalBttvEmotes()

        if (!data) {
            await logMessage([`-> Failed to look up BTTV global emotes`])
            return
        }

        const bttvEmotes = data.map(obj => obj.code)
        settings.globalEmotes.bttv = [...bttvEmotes]
        await logMessage([`-> Found ${pluralize(settings.globalEmotes.bttv.length, `BTTV global emote`, `BTTV global emotes`)}`])
    },
    async getStreamBttvEmotes(channel) {
        await logMessage([`> getStreamBttvEmotes(channel: '${channel}')`])
        const data = await apiGetStreamBttvEmotes(lemonyFresh[channel].id)

        if (!data) {
            lemonyFresh[channel].bttvEmotes = []
            await logMessage([`-> No BTTV emotes found for '${channel}'`])
            return
        }
        const bttvEmotes = [data.channelEmotes.map(el => el.code), data.sharedEmotes.map(el => el.code)]
        lemonyFresh[channel].bttvEmotes = [...bttvEmotes]
        await logMessage([`-> ${pluralize(lemonyFresh[channel].bttvEmotes.length, `BTTV emote`, `BTTV emotes`)} for '${channel}'`])
    }
}

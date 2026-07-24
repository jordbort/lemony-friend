const API_KEY = process.env.API_KEY

const { settings, lemonyFresh } = require(`../data`)
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
        const { bot, chatroom, message, aprilFools } = props
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
                ? aprilFools
                    ? bot.say(chatroom, `${data.sentiment} ${data.score}`)
                    : data.sentiment.includes(`NEUTRAL`)
                        ? bot.say(chatroom, `:p`)
                        : data.sentiment.includes(`POSITIVE`)
                            ? data.sentiment.includes(`WEAK`)
                                ? bot.say(chatroom, `:)`)
                                : bot.say(chatroom, `:D`)
                            : bot.say(chatroom, `:(`)
                : bot.say(chatroom, `:O`)
        } catch (err) {
            logMessage([`checkSentiment ${err}`])
            bot.say(chatroom, `:O`)
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
        const { bot, chatroom, args, channel, aprilFools } = props
        const query = args.join(` `).replace(/[\\{`}%^|]/g, ``)
        await logMessage([`> getDefinition(chatroom: ${chatroom}, query: '${query}')`])
        if (!query) {
            bot.say(chatroom, `Please give me a word to define! :)`)
            return
        }

        const endpoint = `https://api.api-ninjas.com/v1/dictionary?word=${query}`
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
            } else if (aprilFools) {
                bot.say(chatroom, `Definition of "${data.word}": ${data.definition.replace(/\n/g, ` `)}`)
            } else {
                let definition = `Definition of "${data.word}": `
                const splitDefinition = data.definition.replace(/\n/g, ` `).split(`. `).filter(el => el !== `\n`)

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

            const generations = {
                'generation-i': 1,
                'generation-ii': 2,
                'generation-iii': 3,
                'generation-iv': 4,
                'generation-v': 5,
                'generation-vi': 6,
                'generation-vii': 7,
                'generation-viii': 8,
                'generation-ix': 9,
                'generation-x': 10,
                'generation-xi': 11,
                'generation-xii': 12,
                'generation-xiii': 13,
                'generation-xiv': 14,
                'generation-xv': 15,
                'generation-xvi': 16,
                'generation-xvii': 17,
                'generation-xviii': 18,
                'generation-xix': 19,
                'generation-xx': 20
            }

            // Build response
            let reply = `#${data.id} ${pokemon.toUpperCase()} `
            const pokemonTypes = data.types.map(obj => obj.type.name)
            reply += `(${pokemonTypes.join(`/`)}) `

            // Look up generation
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`)
                const species = await response.json()
                reply += `Gen ${generations[species.generation.name]} - `
            } catch (err) {
                logMessage([`getPokemon species '${data.species.name}' ${err}`])
            }

            // Add abilities and stats
            const pokemonAbilities = data.abilities.map(obj => obj.ability.name)
            reply += `${pokemonAbilities.length === 1 ? `Ability` : `Abilities`}: ${pokemonAbilities.join(`, `)} - `
            reply += `Base stats: ${data.stats.map(obj => `${obj.base_stat} ${obj.stat.name}`).join(`, `)} - `

            // Look up type weaknesses and resistances
            const doubleDamageFrom = {}
            const halfDamageFrom = {}
            const immuneFrom = []
            for (const type of pokemonTypes) {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
                    const typeData = await response.json()
                    typeData.damage_relations.double_damage_from.forEach(damageType => damageType.name in doubleDamageFrom ? doubleDamageFrom[damageType.name]++ : doubleDamageFrom[damageType.name] = 1)
                    typeData.damage_relations.half_damage_from.forEach(damageType => damageType.name in halfDamageFrom ? halfDamageFrom[damageType.name]++ : halfDamageFrom[damageType.name] = 1)
                    typeData.damage_relations.no_damage_from.forEach(damageType => { if (!immuneFrom.includes(damageType.name)) immuneFrom.push(damageType.name) })
                } catch (err) {
                    logMessage([`getPokemon type '${type}' ${err}`])
                }
            }

            // Normal damage when both weak and resistant
            for (const dupe in doubleDamageFrom) {
                if (dupe in halfDamageFrom) {
                    delete doubleDamageFrom[dupe]
                    delete halfDamageFrom[dupe]
                }
            }

            // Cleaning up immunities
            for (const type of immuneFrom) {
                if (type in halfDamageFrom) { delete halfDamageFrom[type] }
                if (type in doubleDamageFrom) { delete doubleDamageFrom[type] }
            }

            // Calculate weaknesses and resistances
            const quadrupleDamageFrom = Object.keys(doubleDamageFrom).filter(typeName => doubleDamageFrom[typeName] === 2)
            if (quadrupleDamageFrom.length) { reply += `4x weak to ${quadrupleDamageFrom.join(`/`)}-type moves. ` }
            if (Object.keys(doubleDamageFrom).filter(typeName => doubleDamageFrom[typeName] === 1).length) { reply += `2x weak to ${Object.keys(doubleDamageFrom).filter(typeName => doubleDamageFrom[typeName] === 1).join(`/`)}-type moves. ` }
            if (Object.keys(halfDamageFrom).filter(typeName => halfDamageFrom[typeName] === 1).length) { reply += `2x resistance to ${Object.keys(halfDamageFrom).filter(typeName => halfDamageFrom[typeName] === 1).join(`/`)}-type moves. ` }
            const quarterDamageFrom = Object.keys(halfDamageFrom).filter(typeName => halfDamageFrom[typeName] === 2)
            if (quarterDamageFrom.length) { reply += `4x resistance to ${quarterDamageFrom.join(`/`)}-type moves. ` }
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
        const negativeEmote = getContextEmote(`negative`, channel)

        if (!query) {
            bot.say(chatroom, `No query provided! ${negativeEmote}`)
            return
        }

        try {
            const response = await fetch(`https://unofficialurbandictionaryapi.com/api/search?term=${query}`)
            const data = await response.json()
            await logMessage([`getUrbanDictionaryDefinition`, response.status, renderObj(data, `data`)])

            if (data.statusCode !== 200) {
                bot.say(chatroom, `Error getting definition! ${negativeEmote}`)
            }

            const objDefinition = data.data[Math.floor(Math.random() * data.data.length)]
            const reply = data.found
                ? `"${query}" (${pluralize(data.data.length, `definition`, `definitions`)} found): ${objDefinition.meaning} - ex: "${objDefinition.example}" (${objDefinition.date})`
                : `No definition found! ${negativeEmote}`

            bot.say(chatroom, reply)
        } catch (err) {
            logMessage([`getUrbanDictionaryDefinition ${err}`])
            bot.say(chatroom, `Error getting definition! ${negativeEmote}`)
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
        const bttvEmotes = [...data.channelEmotes.map(el => el.code), ...data.sharedEmotes.map(el => el.code)]
        lemonyFresh[channel].bttvEmotes = [...bttvEmotes]
        await logMessage([`-> ${pluralize(lemonyFresh[channel].bttvEmotes.length, `BTTV emote`, `BTTV emotes`)} for '${channel}'`])
    },
    async apiGetRandomWord(bot, chatroom, aprilFools) {
        await logMessage([`> apiGetRandomWord()`])
        const endpoint = `https://api.api-ninjas.com/v2/randomword`
        const options = {
            headers: {
                'X-Api-Key': API_KEY
            }
        }

        let word
        let valid = false
        do {
            try {
                const response = await fetch(endpoint, options)
                const data = await response.json()
                await logMessage([`-> Random word:`, data])

                if (aprilFools) { return data[0].toLowerCase() }

                if (data[0] !== data[0].toLowerCase()) {
                    await logMessage([`--> '${data[0]}' may be a proper noun, retrying...`])
                    bot.say(chatroom, `Not doing "${data[0]}"...`)
                    continue
                }
                word = data[0]

                try {
                    const endpoint = `https://api.api-ninjas.com/v1/dictionary?word=${word}`
                    const response = await fetch(endpoint, options)
                    const data = await response.json()
                    if (!data.valid) {
                        await logMessage([`--> No defininition for '${word}', retrying...`])
                        bot.say(chatroom, `Not doing "${word}"...`)
                    }
                    valid = data.valid
                } catch (err) {
                    logMessage([`(Validating word) ${err}`])
                    return false
                }
            } catch (err) {
                logMessage([`apiGetRandomWord ${err}`])
                return false
            }
        } while (!valid)

        return word
    }
}

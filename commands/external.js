const API_KEY = process.env.API_KEY

const { resetTxt, grayTxt, settings } = require(`../config`)

const { getNegativeEmote } = require(`../utils`)

module.exports = {
    async getDadJoke(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> getDadJoke(chatroom: ${chatroom})${resetTxt}`) }

        const response = await fetch("https://icanhazdadjoke.com/", {
            headers: {
                "Accept": "application/json",
            }
        })
        const data = await response.json()
        if (settings.debug) { console.log(data) }

        const negativeEmote = getNegativeEmote(channel)
        data.status === 200
            ? bot.say(chatroom, data.joke)
            : bot.say(chatroom, `Error fetching dad joke! ${negativeEmote}`)
    },
    async getDefinition(props) {
        const { bot, chatroom, args, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> getDefinition(chatroom: ${chatroom}, args:`, args, `)${resetTxt}`) }
        const str = args.join(` `)
        if (!str) { return bot.say(chatroom, `Please give me a word to define! :)`) }

        const endpoint = `https://api.api-ninjas.com/v1/dictionary?word=${str}`
        const options = {
            headers: {
                'X-Api-Key': API_KEY
            }
        }

        const response = await fetch(endpoint, options)
        const data = await response.json()
        if (settings.debug) { console.log(data) }

        const negativeEmote = getNegativeEmote(channel)
        if ('error' in data) {
            bot.say(chatroom, `Error: ${data.error} ${negativeEmote}`)
        } else if (!data.valid || !data.definition) {
            bot.say(chatroom, `I don't think "${data.word}" is a word! ${negativeEmote}`)
        } else {
            let definition = `Definition of "${data.word}":`
            const splitDefinition = data.definition.split(`. `)
            if (splitDefinition.includes(`1`)) { definition += ` 1) ${splitDefinition[splitDefinition.indexOf(`1`) + 1]}.` }
            if (splitDefinition.includes(`2`)) { definition += ` 2) ${splitDefinition[splitDefinition.indexOf(`2`) + 1]}.` }
            bot.say(chatroom, definition)
        }
    },
    async getPokemon(props) {
        const { bot, chatroom, args, channel } = props
        const pokemon = args[0]?.toLowerCase()
        if (settings.debug) { console.log(`${grayTxt}> getPokemon(chatroom: ${chatroom}, pokemon: ${pokemon})${resetTxt}`) }

        if (!pokemon) {
            if (settings.debug) { console.log(`${grayTxt}-> No Pokemon provided${resetTxt}`) }
            return
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        const negativeEmote = getNegativeEmote(channel)
        if (response.statusText !== `OK`) {
            bot.say(chatroom, `Pokemon ${pokemon} was not found! ${negativeEmote}`)
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

        let type1Data
        let type2Data
        const doubleDamageTo = []
        const doubleDamageFrom = []
        const halfDamageTo = []
        const halfDamageFrom = []
        const immuneTo = []
        const immuneFrom = []

        if (pokemonTypes[0]) {
            // look up one type
            const response1 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[0]}`)
            type1Data = await response1.json()
            for (const damageType of type1Data.damage_relations.double_damage_to) {
                if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
            }
            for (const damageType of type1Data.damage_relations.double_damage_from) {
                if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
            }
            for (const damageType of type1Data.damage_relations.half_damage_to) {
                if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
            }
            for (const damageType of type1Data.damage_relations.half_damage_from) {
                if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
            }
            for (const damageType of type1Data.damage_relations.no_damage_to) {
                if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
            }
            for (const damageType of type1Data.damage_relations.no_damage_from) {
                if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
            }
        }
        if (pokemonTypes[1]) {
            // look up two types
            const response2 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[1]}`)
            type2Data = await response2.json()
            for (const damageType of type2Data.damage_relations.double_damage_to) {
                if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
            }
            for (const damageType of type2Data.damage_relations.double_damage_from) {
                if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
            }
            for (const damageType of type2Data.damage_relations.half_damage_to) {
                if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
            }
            for (const damageType of type2Data.damage_relations.half_damage_from) {
                if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
            }
            for (const damageType of type2Data.damage_relations.no_damage_to) {
                if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
            }
            for (const damageType of type2Data.damage_relations.no_damage_from) {
                if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
            }
        }

        // if it TAKES double damage AND half damage FROM a type, remove from BOTH arrays
        const nullify = []
        for (const type of doubleDamageFrom) {
            if (settings.debug) { console.log(`Looking at:`, doubleDamageFrom.indexOf(type), type) }
            if (halfDamageFrom.includes(type)) {
                if (settings.debug) { console.log(`Found in both:`, type) }
                nullify.push(type)
            }
        }
        for (const dupe of nullify) {
            doubleDamageFrom.splice(doubleDamageFrom.indexOf(dupe), 1)
            halfDamageFrom.splice(halfDamageFrom.indexOf(dupe), 1)
        }

        // Cleaning up immunities
        for (const type of immuneFrom) {
            if (halfDamageFrom.includes(type)) {
                if (settings.debug) { console.log(`"Immunity from" found in halfDamageFrom:`, type) }
                halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1)
            }
            if (doubleDamageFrom.includes(type)) {
                if (settings.debug) { console.log(`"Immunity from" found in doubleDamageFrom:`, type) }
                doubleDamageFrom.splice(doubleDamageFrom.indexOf(type), 1)
            }
        }

        if (settings.debug) {
            console.log(`nullify:`, nullify)
            console.log(`doubleDamageTo:`, doubleDamageTo)
            console.log(`doubleDamageFrom:`, doubleDamageFrom)
            console.log(`halfDamageTo:`, halfDamageTo)
            console.log(`halfDamageFrom:`, halfDamageFrom)
            console.log(`immuneTo:`, immuneTo)
            console.log(`immuneFrom:`, immuneFrom)
        }

        if (doubleDamageTo.length > 0) { reply += `Super effective to ${doubleDamageTo.join(`/`)}-type Pokemon. ` }
        if (doubleDamageFrom.length > 0) { reply += `Weak to ${doubleDamageFrom.join(`/`)}-type moves. ` }
        if (halfDamageTo.length > 0) { reply += `Not very effective to ${halfDamageTo.join(`/`)}-type Pokemon. ` }
        if (halfDamageFrom.length > 0) { reply += `Resistant to ${halfDamageFrom.join(`/`)}-type moves. ` }
        if (immuneTo.length > 0) { reply += `No effect to ${immuneTo.join(`/`)}-type Pokemon. ` }
        if (immuneFrom.length > 0) { reply += `No effect from ${immuneFrom.join(`/`)}-type moves.` }
        bot.say(chatroom, reply)
    }
}

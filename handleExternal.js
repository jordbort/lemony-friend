const API_KEY = process.env.API_KEY

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import helper functions
const { talk } = require(`./utils`)

async function checkSentiment(chatroom, msg) {
    if (settings.debug) { console.log(`${boldTxt}> checkSentiment(chatroom: ${chatroom}, msg: ${msg})${resetTxt}`) }

    const endpoint = `https://api.api-ninjas.com/v1/sentiment?text=${msg}`
    const options = {
        headers: {
            'X-Api-Key': API_KEY
        }
    }

    const response = await fetch(endpoint, options)
    const data = await response.json()
    console.log(data)

    'sentiment' in data
        ? data.sentiment.includes(`NEUTRAL`)
            ? talk(chatroom, `:p`)
            : data.sentiment.includes(`POSITIVE`)
                ? data.sentiment.includes(`WEAK`)
                    ? talk(chatroom, `:)`)
                    : talk(chatroom, `:D`)
                : talk(chatroom, `:(`)
        : talk(chatroom, `:O`)
}

async function getDadJoke(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> getDadJoke(chatroom: ${chatroom})${resetTxt}`) }
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            "Accept": "application/json",
        }
    })
    const data = await response.json()
    if (settings.debug) { console.log(data) }
    data.status === 200
        ? talk(chatroom, data.joke)
        : talk(chatroom, `Error fetching dad joke! :(`)
}

async function getPokemon(chatroom, pokemon) {
    if (settings.debug) { console.log(`${boldTxt}> getPokemon(chatroom: ${chatroom}, pokemon: ${pokemon})${resetTxt}`) }
    if (!pokemon) { return }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    if (response.statusText !== `OK`) {
        talk(chatroom, `Pokemon ${pokemon} was not found! :(`)
        return
    }
    const data = await response.json()

    let message = `#${data.id} ${pokemon.toUpperCase()} `

    const pokemonTypes = []
    for (const types of data.types) { pokemonTypes.push(types.type.name) }
    message += `(${pokemonTypes.join(`/`)}) - ${data.abilities.length === 1 ? `Ability` : `Abilities`}: `

    const pokemonAbilities = []
    for (const abilities of data.abilities) { pokemonAbilities.push(`${abilities.ability.name}${abilities.is_hidden ? ` (hidden)` : ``}`) }
    message += `${pokemonAbilities.join(`, `)}. `

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
        console.log(`Looking at:`, doubleDamageFrom.indexOf(type), type)
        if (halfDamageFrom.includes(type)) {
            console.log(`Found in both:`, type)
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
            console.log(`"Immunity from" found in halfDamageFrom:`, type)
            halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1)
        }
        if (doubleDamageFrom.includes(type)) {
            console.log(`"Immunity from" found in doubleDamageFrom:`, type)
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

    if (doubleDamageTo.length > 0) { message += `Super effective to ${doubleDamageTo.join(`/`)}-type Pokemon. ` }
    if (doubleDamageFrom.length > 0) { message += `Weak to ${doubleDamageFrom.join(`/`)}-type moves. ` }
    if (halfDamageTo.length > 0) { message += `Not very effective to ${halfDamageTo.join(`/`)}-type Pokemon. ` }
    if (halfDamageFrom.length > 0) { message += `Resistant to ${halfDamageFrom.join(`/`)}-type moves. ` }
    if (immuneTo.length > 0) { message += `No effect to ${immuneTo.join(`/`)}-type Pokemon. ` }
    if (immuneFrom.length > 0) { message += `No effect from ${immuneFrom.join(`/`)}-type moves.` }
    talk(chatroom, message)
}

module.exports = {
    checkSentiment,
    getDadJoke,
    getPokemon
}

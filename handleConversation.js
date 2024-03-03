const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings, timers } = require(`./config`)

// Import emotes
const { getGreetingEmote, getPositiveEmote, getByeEmote } = require(`./getEmotes`)

// Import helper functions
const { talk, resetCooldownTimer } = require(`./utils`)

function handleNewChatter(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleNewChatter(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (timers[`new-chatter`].listening) {
        resetCooldownTimer(`new-chatter`)

        const greetings = [
            `Hi ${user.displayName}, welcome to the stream!`,
            `Hey ${user.displayName}, welcome to the stream!`,
            `Welcome to the stream, ${user.displayName}!`,
            `Hi ${user.displayName}, welcome in!`,
            `Hi @${user.displayName}`,
            `Hello @${user.displayName} welcome in!`,
            `@${user.displayName} welcome 2 ${chatroom.substring(1, 5)} strem`,
        ]
        const greeting = greetings[Math.floor(Math.random() * greetings.length)]

        const channel = chatroom.substring(1)
        const greetingEmote = getGreetingEmote(channel)
        setTimeout(() => talk(chatroom, `${greeting} ${greetingEmote}`), 5000)
    } else { console.log(`${grayTxt}> Must wait for 'newChatter' cooldown${resetTxt}`) }
}

function handleGreet(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (timers[`greet`].listening) {
        resetCooldownTimer(`greet`)

        const greetings = [
            `Howdy,`,
            `Hello,`,
            `Hey,`,
            `Hi,`,
            `Hey there,`,
            `Hello`,
            `Hey`,
            `Hi`,
            `Hey there`
        ]
        const greeting = Math.floor(Math.random() * greetings.length)

        let response = `${greetings[greeting]} ${user.displayName}`
        const channel = chatroom.substring(1)
        const greetingEmote = getGreetingEmote(channel)

        // If the greeting is "Howdy"
        if (greeting === 0) {
            response += `! ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Ram` : greetingEmote}`
        }
        // If there's a comma after the greeting
        else if (greeting < greetings.indexOf(`Hello`)) {
            const appends = [
                `How are you doing today?`,
                `How are you today?`,
                `How are you doing?`,
                `How are you?`,
                `How's it going?`,
                `How goes it?`
            ]
            response += `! ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        // If there's no comma after the greeting
        else {
            const appends = [
                `how are you doing today?`,
                `how are you today?`,
                `how are you doing?`,
                `how are you?`,
                `how's it going?`,
                `how goes it?`
            ]
            response += `, ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        talk(chatroom, response)
    } else { console.log(`${grayTxt}> Must wait for 'greet' cooldown${resetTxt}`) }
}

function handleMassGreet(chatroom, arr) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, arr: ${arr})${resetTxt}`) }
    if (timers[`mass-greet`].listening) {
        resetCooldownTimer(`mass-greet`)

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
        const channel = chatroom.substring(1)
        const greetingEmote = getGreetingEmote(channel)

        const response = []
        for (let str of arr) {
            while (str.startsWith(`@`)) { str = str.substring(1) }
            str.toLowerCase() in users
                ? response.push(`${randomGreeting} ${users[str.toLowerCase()].displayName} ${greetingEmote}`)
                : response.push(`${randomGreeting} ${str} ${greetingEmote}`)
        }
        talk(chatroom, response.join(` `))
    } else { console.log(`${grayTxt}> Must wait for 'massGreet' cooldown${resetTxt}`) }
}

function handleGreetAll(chatroom, currentTime) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreetAll(chatroom: ${chatroom}, currentTime: ${currentTime})${resetTxt}`) }
    if (timers[`greet-all`].listening) {
        resetCooldownTimer(`greet-all`)
        const channel = chatroom.substring(1)

        const excludedNames = [
            BOT_USERNAME,
            `nightbot`,
            `streamelements`,
            `blerp`,
            `soundalerts`,
            `streamlabs`,
            `undertalebot`,
            `buttsbot`
        ]
        const usersToGreet = []
        for (const user in users) {
            if (!excludedNames.includes(user) && channel in users[user]) {
                const lastChattedAtMins = Number(((currentTime - users[user][channel].sentAt) / 60000).toFixed(2))
                if (lastChattedAtMins < 60) {
                    usersToGreet.push(users[user].displayName)
                } else {
                    console.log(`${grayTxt}${users[user].displayName} has not chatted in the past 60 minutes, ignoring...${resetTxt}`, lastChattedAtMins)
                }
            }
        }

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]

        const greetingEmote = getGreetingEmote(channel)
        const response = usersToGreet.map((user) => `${randomGreeting} ${user} ${greetingEmote}`)
        talk(chatroom, response.join(` `))
    } else { console.log(`${grayTxt}> Must wait for 'greetAll' cooldown${resetTxt}`) }
}

function sayGoodnight(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (timers[`say-goodnight`].listening) {
        resetCooldownTimer(`say-goodnight`)

        const greetings = [
            `Bye`,
            `Good night,`,
            `Sleep well,`,
            `See you next time,`,
            `Have a good night,`
        ]
        const greeting = Math.floor(Math.random() * greetings.length)

        let response = `${greetings[greeting]} ${user.displayName}`
        if (greeting === 0) {
            const appends = [
                `sleep well`,
                `see you next time`,
                `have a good night`,
            ]
            response += `, ${appends[Math.floor(Math.random() * appends.length)]}`
        }

        const channel = chatroom.substring(1)
        const byeEmote = getByeEmote(channel)
        response += `! ${byeEmote}`
        talk(chatroom, response)
    } else { console.log(`${grayTxt}> Must wait for 'sayGoodnight' cooldown${resetTxt}`) }
}

function sayYoureWelcome(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> sayYoureWelcome(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (timers[`say-youre-welcome`].listening) {
        resetCooldownTimer(`say-youre-welcome`)

        const welcomes = [
            `${user.displayName}`,
            `You're welcome, ${user.displayName}`,
            `No problem, ${user.displayName}`,
            `My pleasure, ${user.displayName}`,
        ]
        const welcome = Math.floor(Math.random() * welcomes.length)

        let response = `${welcomes[welcome]}`
        if (welcome === 0) {
            const appends = [
                `you're welcome`,
                `no problem`,
                `my pleasure`
            ]
            response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
        }

        const channel = chatroom.substring(1)
        const positiveEmote = getPositiveEmote(channel)
        response += `! ${positiveEmote}`
        talk(chatroom, response)
    } else { console.log(`${grayTxt}> Must wait for 'sayYoureWelcome' cooldown${resetTxt}`) }
}

function sayThanks(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> sayThanks(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (timers[`say-thanks`].listening) {
        resetCooldownTimer(`say-thanks`)

        const thanks = [
            `${user.displayName}`,
            `Thanks, ${user.displayName}`,
            `Thanks, ${user.displayName}`,
            `Thanks, ${user.displayName}`,
            `Thank you, ${user.displayName}`,
            `Thank you, ${user.displayName}`,
            `Thank you, ${user.displayName}`,
            `Thank you so much, ${user.displayName}`,
            `Hey thanks, ${user.displayName}`,
            `Aw thanks, ${user.displayName}`
        ]
        const sentiment = Math.floor(Math.random() * thanks.length)

        let response = `${thanks[sentiment]}`
        if (sentiment === 0) {
            const appends = [
                `thanks`,
                `thank you`,
                `thank you so much`
            ]
            response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
        }

        const channel = chatroom.substring(1)
        const positiveEmote = getPositiveEmote(channel)
        response += `! ${positiveEmote}`
        talk(chatroom, response)
    } else { console.log(`${grayTxt}> Must wait for 'sayThanks' cooldown${resetTxt}`) }
}

module.exports = {
    handleNewChatter,
    handleGreet,
    handleMassGreet,
    handleGreetAll,
    sayGoodnight,
    sayYoureWelcome,
    sayThanks
}

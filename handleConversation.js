const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings } = require(`./config`)

// Import helper functions
const { talk, getHappyEmote, getGreetingEmote } = require(`./utils`)

function handleNewChatter(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleNewChatter(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Hi ${user.displayName}, welcome to the stream!`,
        `Hey ${user.displayName}, welcome to the stream!`,
        `Welcome to the stream, ${user.displayName}!`,
        `Hi ${user.displayName}, welcome in!`,
        `Hi ${user.displayName} ${getHappyEmote()}`,
        `Hello @${user.displayName} welcome in!`,
        `@${user.displayName} welcome 2 ${chatroom.substring(1, 5)} strem`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    setTimeout(() => talk(chatroom, greeting), 5000)
}

function handleGreet(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const happyEmote = getHappyEmote()
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

    // If the greeting is "Howdy"
    if (greeting === 0) {
        response += `! ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Ram` : happyEmote}`
    } else if (greeting < greetings.indexOf(`Hello`)) {
        // If there's a comma after the greeting
        const appends = [
            `How are you doing today?`,
            `How are you today?`,
            `How are you doing?`,
            `How are you?`,
            `How's it going?`,
            `How goes it?`
        ]
        response += `! ${appends[Math.floor(Math.random() * appends.length)]} ${happyEmote}`
    } else {
        // If there's no comma after the greeting
        const appends = [
            `how are you doing today?`,
            `how are you today?`,
            `how are you doing?`,
            `how are you?`,
            `how's it going?`,
            `how goes it?`
        ]
        response += `, ${appends[Math.floor(Math.random() * appends.length)]} ${happyEmote}`
    }
    talk(chatroom, response)
}

function handleMassGreet(chatroom, arr) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, arr: ${arr})${resetTxt}`) }
    const response = []
    const greetings = [
        `hello`,
        `howdy`,
        `hey`,
        `hi`
    ]
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    const greetingEmote = getGreetingEmote()
    for (let str of arr) {
        while (str.startsWith(`@`)) { str = str.substring(1) }
        str.toLowerCase() in users
            ? response.push(`${randomGreeting} ${users[str.toLowerCase()].displayName} ${greetingEmote}`)
            : response.push(`${randomGreeting} ${str} ${greetingEmote}`)
    }
    talk(chatroom, response.join(` `))
}

function handleGreetAll(chatroom, currentTime) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreetAll(chatroom: ${chatroom}, currentTime: ${currentTime})${resetTxt}`) }
    const channel = chatroom.substring(1)

    const usersToGreet = []
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
    const greetingEmote = getGreetingEmote()

    const response = usersToGreet.map((user) => `${randomGreeting} ${user} ${greetingEmote}`)
    talk(chatroom, response.join(` `))
}

function sayGoodnight(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
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
    response += `! ${getGreetingEmote()}`
    talk(chatroom, response)
}

function sayYoureWelcome(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> sayYoureWelcome(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
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
    response += `! ${getGreetingEmote()}`
    talk(chatroom, response)
}

function sayThanks(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> sayThanks(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
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
    response += `! ${getGreetingEmote()}`
    talk(chatroom, response)
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

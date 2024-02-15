const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import data
const { users } = require(`./data`)

// Import helper functions
const { getHappyEmote, getSadEmote, talk } = require(`./utils`)

function handleColorChange(chatroom, user, newColor) {
    if (settings.debug) { console.log(`${boldTxt}> handleColorChange(chatroom: ${chatroom}, user: ${user.displayName}, newColor: ${newColor})${resetTxt}`) }
    user.color = newColor
    talk(chatroom, `Acknowledging ${user.displayName}'s color change :)`)
}

function handleTurboChange(chatroom, user, turboStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleTurboChange(chatroom: ${chatroom}, user: ${user.displayName}, turboStatus: ${turboStatus})${resetTxt}`) }

    user.turbo = turboStatus
    const channel = chatroom.substring(1)
    const happyEmote = getHappyEmote(channel)
    const sadEmote = getSadEmote(channel)

    turboStatus ? talk(chatroom, `Wow, ${user.displayName} got Turbo? ${happyEmote}`) : talk(chatroom, `Did ${user.displayName} stop having Turbo? ${sadEmote}`)
}

function handleSubChange(chatroom, username, subStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleSubChange(chatroom: ${chatroom}, username: ${username}, subStatus: ${subStatus})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const user = users[username]

    user[channel].sub = subStatus
    const happyEmote = getHappyEmote(channel)
    const sadEmote = getSadEmote(channel)

    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => subStatus
            ? talk(chatroom, `Thank you for the gift sub! ${happyEmote}`)
            : talk(chatroom, `Aww, did I lose my sub? ${sadEmote}`), 2000)
    } else {
        subStatus
            ? talk(chatroom, `Wow, ${user.displayName} is subbed now! ${happyEmote}`)
            : talk(chatroom, `Did ${user.displayName} just lose their sub? ${sadEmote}`)
    }
}

function handleModChange(chatroom, username, modStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleModChange(chatroom: ${chatroom}, username: ${username}, modStatus: ${modStatus})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const user = users[username]

    user[channel].mod = modStatus
    const happyEmote = getHappyEmote(channel)
    const sadEmote = getSadEmote(channel)

    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => modStatus
            ? talk(chatroom, `Thank you for modding me! ${happyEmote}`)
            : talk(chatroom, `Was I just unmodded? ${sadEmote}`), 2000)
    } else {
        modStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a mod! ${happyEmote}`)
            : talk(chatroom, `Was ${user.displayName} just unmodded? ${sadEmote}`)
    }
}

function handleVIPChange(chatroom, username, vipStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleVIPChange(chatroom: ${chatroom}, username: ${username}, vipStatus: ${vipStatus})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const user = users[username]

    user[channel].vip = vipStatus
    const happyEmote = getHappyEmote(channel)
    const sadEmote = getSadEmote(channel)

    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => vipStatus
            ? talk(chatroom, `Thank you for giving me VIP! ${happyEmote}`)
            : talk(chatroom, `Did I just lose VIP? ${sadEmote}`), 2000)
    } else {
        vipStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a VIP! ${happyEmote}`)
            : talk(chatroom, `Did ${user.displayName} just lose VIP status? ${sadEmote}`)
    }
}

module.exports = {
    handleColorChange,
    handleTurboChange,
    handleSubChange,
    handleModChange,
    handleVIPChange
}

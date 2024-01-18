const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import helper functions
const { talk } = require(`./utils`)



function handleColorChange(chatroom, user, newColor) {
    if (settings.debug) { console.log(`${boldTxt}> handleColorChange(chatroom: ${chatroom}, user: ${user.displayName}, newColor: ${newColor})${resetTxt}`) }
    user.color = newColor
    talk(chatroom, `Acknowledging ${user.displayName}'s color change :)`)
}

function handleTurboChange(chatroom, user, turboStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleTurboChange(chatroom: ${chatroom}, user: ${user.displayName}, turboStatus: ${turboStatus})${resetTxt}`) }
    user.turbo = turboStatus
    turboStatus ? talk(chatroom, `Wow, ${user.displayName} got Turbo? :D`) : talk(chatroom, `Did ${user.displayName} stop having Turbo? :O`)
}

function handleSubChange(chatroom, user, subStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleSubChange(chatroom: ${chatroom}, user: ${user.displayName}, subStatus: ${subStatus})${resetTxt}`) }
    user[chatroom.slice(1)].sub = subStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => subStatus
            ? talk(chatroom, `Thank you for the gift sub! :D`)
            : talk(chatroom, `Aww, did I lose my sub? :(`), 2000)
    } else {
        subStatus
            ? talk(chatroom, `Wow, ${user.displayName} is subbed now! :D`)
            : talk(chatroom, `Did ${user.displayName} just lose their sub? :O`)
    }
}

function handleModChange(chatroom, user, modStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleModChange(chatroom: ${chatroom}, user: ${user.displayName}, modStatus: ${modStatus})${resetTxt}`) }
    user[chatroom.slice(1)].mod = modStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => modStatus
            ? talk(chatroom, `Thank you for modding me! :D`)
            : talk(chatroom, `Was I just unmodded? :O`), 2000)
    } else {
        modStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a mod! :D`)
            : talk(chatroom, `Was ${user.displayName} just unmodded? :O`)
    }
}

function handleVIPChange(chatroom, user, vipStatus) {
    if (settings.debug) { console.log(`${boldTxt}> handleVIPChange(chatroom: ${chatroom}, user: ${user.displayName}, vipStatus: ${vipStatus})${resetTxt}`) }
    user[chatroom.slice(1)].vip = vipStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => vipStatus
            ? talk(chatroom, `Thank you for giving me VIP! :D`)
            : talk(chatroom, `Did I just lose VIP? :O`), 2000)
    } else {
        vipStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a VIP! :D`)
            : talk(chatroom, `Did ${user.displayName} just lose VIP status? :O`)
    }
}

module.exports = {
    handleColorChange,
    handleTurboChange,
    handleSubChange,
    handleModChange,
    handleVIPChange
}

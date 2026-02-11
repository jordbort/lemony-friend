const { lemonyFresh } = require(`../data`)
const { getContextEmote, logMessage } = require(`../utils`)

function getItem(bot, chatroom, channel, idx) {
    logMessage([`-> getItem(idx: ${idx})`])
    const listName = lemonyFresh[channel].list[0] || `the list`
    const negativeEmote = getContextEmote(`negative`, channel)

    lemonyFresh[channel].list[idx] && idx !== 0
        ? bot.say(chatroom, `#${idx} from ${listName}: ${lemonyFresh[channel].list[idx]}`)
        : bot.say(chatroom, `#${idx} doesn't exist in ${listName}! ${negativeEmote}`)
}


function addItem(bot, chatroom, channel, args, isModOrVIP) {
    logMessage([`-> addItem(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to add items to the list! ${negativeEmote}`)
        return
    }

    const listName = lemonyFresh[channel].list[0] || `the list`
    const newItem = args.slice(1).join(` `)
    const positiveEmote = getContextEmote(`positive`, channel)
    const dumbEmote = getContextEmote(`dumb`, channel)

    if (newItem) {
        if (lemonyFresh[channel].list.includes(newItem)) {
            const idx = lemonyFresh[channel].list.indexOf(newItem)
            bot.say(chatroom, `List already includes "${newItem}" as item #${idx}! ${dumbEmote}`)
        } else {
            lemonyFresh[channel].list.push(newItem)
            bot.say(chatroom, `Added #${lemonyFresh[channel].list.length - 1} to ${listName}! ${positiveEmote}`)
        }
    } else { bot.say(chatroom, `Nothing added to ${listName}! ${dumbEmote}`) }
}

function editItem(bot, chatroom, channel, args, isModOrVIP) {
    logMessage([`-> editItem(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to edit items on list! ${negativeEmote}`)
        return
    }

    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getContextEmote(`positive`, channel)
    const dumbEmote = getContextEmote(`dumb`, channel)

    const idx = Number(args[1])
    // Index is NaN, zero, or doesn't exist in array
    if (!idx || !lemonyFresh[channel].list[idx]) {
        bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }

    const updatedItem = args.slice(2).join(` `)
    // No replacement text passed in
    if (!updatedItem) {
        bot.say(chatroom, `#${idx} in ${listName} was not updated! Did you mean to delete it? ${dumbEmote}`)
        return
    }

    lemonyFresh[channel].list[idx] = updatedItem
    bot.say(chatroom, `Updated #${idx} in ${listName} to: "${updatedItem}" ${positiveEmote}`)
}

function deleteItem(bot, chatroom, channel, args, isModOrVIP) {
    logMessage([`-> deleteItem(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to delete items from the list! ${negativeEmote}`)
        return
    }

    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getContextEmote(`positive`, channel)

    const idx = Number(args[1])
    // Index is NaN, zero, or doesn't exist in array
    if (!idx || !lemonyFresh[channel].list[idx]) {
        bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }

    lemonyFresh[channel].list.splice(idx, 1)
    bot.say(chatroom, `Deleted #${idx} from ${listName}! ${positiveEmote}`)
}

function swapItems(bot, chatroom, channel, args, isModOrVIP) {
    logMessage([`-> swapItems(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to reorder items in the list! ${negativeEmote}`)
        return
    }

    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getContextEmote(`positive`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)

    if (args.length < 3) {
        bot.say(chatroom, `Please provide two numbers to be swapped! ${neutralEmote}`)
        return
    }

    const idxOne = Number(args[1])
    const idxTwo = Number(args[2])
    // Either index is NaN, zero, or doesn't exist in array
    if (!idxOne || !lemonyFresh[channel].list[idxOne]) {
        bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }
    if (!idxTwo || !lemonyFresh[channel].list[idxTwo]) {
        bot.say(chatroom, `${args[2] ? `#${args[2]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }

    const value = lemonyFresh[channel].list[idxOne]
    lemonyFresh[channel].list[idxOne] = lemonyFresh[channel].list[idxTwo]
    lemonyFresh[channel].list[idxTwo] = value

    bot.say(chatroom, `Swapped #${idxOne} and #${idxTwo} in ${listName}! ${positiveEmote}`)
}

function moveItems(bot, chatroom, channel, args, isModOrVIP) {
    const negativeEmote = getContextEmote(`negative`, channel)
    logMessage([`-> moveItems(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to reorder items in the list! ${negativeEmote}`)
        return
    }

    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getContextEmote(`positive`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)

    if (args.length < 3) {
        bot.say(chatroom, `Please provide two numbers: the current position and its new position! ${neutralEmote}`)
        return
    }

    const idxOne = Number(args[1])
    const idxTwo = Number(args[2])
    // Either index is NaN, zero, or doesn't exist in array
    if (!idxOne || !lemonyFresh[channel].list[idxOne]) {
        bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }
    if (!idxTwo || !lemonyFresh[channel].list[idxTwo]) {
        bot.say(chatroom, `${args[2] ? `#${args[2]}` : `Item`} not found in ${listName}! ${negativeEmote}`)
        return
    }

    if (idxOne > idxTwo) {
        const value = lemonyFresh[channel].list[idxOne]
        for (let i = idxOne; i > idxTwo; i--) { lemonyFresh[channel].list[i] = lemonyFresh[channel].list[i - 1] }
        lemonyFresh[channel].list[idxTwo] = value
    } else if (idxOne < idxTwo) {
        const value = lemonyFresh[channel].list[idxOne]
        for (let i = idxOne; i < idxTwo; i++) { lemonyFresh[channel].list[i] = lemonyFresh[channel].list[i + 1] }
        lemonyFresh[channel].list[idxTwo] = value
    }

    bot.say(chatroom, `Moved #${idxOne} in ${listName} to position #${idxTwo}! ${positiveEmote}`)
}

function renameList(bot, chatroom, channel, args, isModOrVIP) {
    const negativeEmote = getContextEmote(`negative`, channel)
    logMessage([`-> renameList(args: '${args.join(`', '`)}', isModOrVIP? ${isModOrVIP})`])
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to rename the list! ${negativeEmote}`)
        return
    }

    const neutralEmote = getContextEmote(`neutral`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)

    const currentName = lemonyFresh[channel].list[0]
    const newName = args.slice(1).join(` `)
    if (currentName === newName) {
        bot.say(chatroom, `List name is already ${currentName ? `"${currentName}"` : `blank`}! ${neutralEmote}`)
        return
    }
    lemonyFresh[channel].list[0] = newName
    bot.say(chatroom, `List name ${newName ? `updated ${currentName ? `from "${currentName}" ` : ``}to "${newName}"` : `has been reset from "${currentName}"`}! ${positiveEmote}`)
}

function clearList(bot, chatroom, channel, resetName, isModOrVIP) {
    logMessage([`-> clearList(resetName? ${resetName}, isModOrVIP? ${isModOrVIP})`])
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!isModOrVIP) {
        bot.say(chatroom, `Only a mod or VIP is allowed to clear/reset the list! ${negativeEmote}`)
        return
    }

    const positiveEmote = getContextEmote(`positive`, channel)

    lemonyFresh[channel].list.length = 1
    if (resetName) { lemonyFresh[channel].list[0] = `` }
    const listName = lemonyFresh[channel].list[0] || `The list`

    bot.say(chatroom, `${listName} has been ${resetName ? `reset` : `cleared`}! ${positiveEmote}`)
}

function getListMethods(bot, chatroom, channel, isModOrVIP) {
    logMessage([`-> getListMethods(isModOrVIP? ${isModOrVIP})`])
    const neutralEmote = getContextEmote(`neutral`, channel)

    isModOrVIP
        ? bot.say(chatroom, `You can use !list to show the full list, or !list <number> or "random" to get a specific or random item from the list! VIPs/mods can also use !list add <new item>, edit <number>, delete <number>, swap/switch <number1> <number2>, move <number1> <number2>, name/rename <list name>, clear (to empty list), and reset (to empty list and reset name)! ${neutralEmote}`)
        : bot.say(chatroom, `You can use !list to show the full list, or !list <number> or "random" to get a specific or random item from the list! ${neutralEmote}`)
}

module.exports = {
    useList(props) {
        const { bot, chatroom, args, channel, isModOrVIP } = props
        logMessage([`> useList(channel: '${channel}', listName: '${lemonyFresh[channel].list[0]}', items: ${lemonyFresh[channel].list.slice(1).length}, args:`, `'${args.join(`', '`)}')`])

        // Get list of all methods
        if (/^help$/i.test(args[0])) {
            getListMethods(bot, chatroom, channel, isModOrVIP)
            return
        }

        // Get item by number
        if (/^-?\d+$/i.test(args[0])) {
            getItem(bot, chatroom, channel, Number(args[0]))
            return
        }

        // Get random item
        if (/^random$/i.test(args[0])) {
            getItem(bot, chatroom, channel, Math.ceil(Math.random() * (lemonyFresh[channel].list.length - 1)))
            return
        }

            return
        }

        // Add item to list
        if (/^add$/i.test(args[0])) {
            addItem(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Edit item in list
        if (/^edit$/i.test(args[0])) {
            editItem(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Delete item from list
        if (/^delete$/i.test(args[0])) {
            deleteItem(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Swap/switch items in list
        if (/^swap$|^switch$/i.test(args[0])) {
            swapItems(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Move items in list
        if (/^move$/i.test(args[0])) {
            moveItems(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Name/rename list
        if (/^(re)?name$/i.test(args[0])) {
            renameList(bot, chatroom, channel, args, isModOrVIP)
            return
        }

        // Clear list contents
        if (/^clear$/i.test(args[0])) {
            clearList(bot, chatroom, channel, false, isModOrVIP)
            return
        }

        // Clear list contents and reset name
        if (/^reset$/i.test(args[0])) {
            clearList(bot, chatroom, channel, true, isModOrVIP)
            return
        }

        // No args, or keyword not recognized
        const listContents = lemonyFresh[channel].list.map((el, idx) => `${idx}) ${el}`)
        listContents.shift()
        const dumbEmote = getContextEmote(`dumb`, channel)

        listContents.length
            ? bot.say(chatroom, `${lemonyFresh[channel].list[0] || `Here's the list`}: ${listContents.join(`, `)}`)
            : bot.say(chatroom, `No items are in ${lemonyFresh[channel].list[0] || `the list`}! ${dumbEmote}`)
    }
}

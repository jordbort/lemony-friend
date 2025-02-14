const { lemonyFresh } = require(`../data`)
const { getNeutralEmote, getPositiveEmote, getNegativeEmote, getDumbEmote, logMessage } = require(`../utils`)

function getItem(bot, chatroom, idx) {
    logMessage([`-> getItem(idx: ${idx})`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const negativeEmote = getNegativeEmote(channel)

    lemonyFresh[channel].list[idx] && idx !== 0
        ? bot.say(chatroom, `#${idx} from ${listName}: ${lemonyFresh[channel].list[idx]}`)
        : bot.say(chatroom, `#${idx} doesn't exist in ${listName}! ${negativeEmote}`)
}

function addItem(bot, chatroom, args) {
    logMessage([`-> addItem(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const newItem = args.slice(1).join(` `)
    const positiveEmote = getPositiveEmote(channel)
    const dumbEmote = getDumbEmote(channel)

    if (newItem) {
        lemonyFresh[channel].list.push(newItem)
        bot.say(chatroom, `Added #${lemonyFresh[channel].list.length - 1} to ${listName}! ${positiveEmote}`)
    } else {
        bot.say(chatroom, `Nothing added to ${listName}! ${dumbEmote}`)
    }
}

function editItem(bot, chatroom, args) {
    logMessage([`-> editItem(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getPositiveEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    const dumbEmote = getDumbEmote(channel)

    const idx = Number(args[1])
    // Index is NaN, zero, or doesn't exist in array
    if (!idx || !lemonyFresh[channel].list[idx]) { return bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }

    const updatedItem = args.slice(2).join(` `)
    // No replacement text passed in
    if (!updatedItem) { return bot.say(chatroom, `#${idx} in ${listName} was not updated! Did you mean to delete it? ${dumbEmote}`) }

    lemonyFresh[channel].list[idx] = updatedItem
    bot.say(chatroom, `Updated #${idx} in ${listName} to: "${updatedItem}" ${positiveEmote}`)
}

function deleteItem(bot, chatroom, args) {
    logMessage([`-> deleteItem(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getPositiveEmote(channel)
    const negativeEmote = getNegativeEmote(channel)

    const idx = Number(args[1])
    // Index is NaN, zero, or doesn't exist in array
    if (!idx || !lemonyFresh[channel].list[idx]) { return bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }

    lemonyFresh[channel].list.splice(idx, 1)
    bot.say(chatroom, `Deleted #${idx} from ${listName}! ${positiveEmote}`)
}

function swapItems(bot, chatroom, args) {
    logMessage([`-> swapItems(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getPositiveEmote(channel)
    const neutralEmote = getNeutralEmote(channel)
    const negativeEmote = getNegativeEmote(channel)

    if (args.length < 3) {
        bot.say(chatroom, `Please provide two numbers to be swapped! ${neutralEmote}`)
        return
    }

    const idxOne = Number(args[1])
    const idxTwo = Number(args[2])
    // Either index is NaN, zero, or doesn't exist in array
    if (!idxOne || !lemonyFresh[channel].list[idxOne]) { return bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }
    if (!idxTwo || !lemonyFresh[channel].list[idxTwo]) { return bot.say(chatroom, `${args[2] ? `#${args[2]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }

    const value = lemonyFresh[channel].list[idxOne]
    lemonyFresh[channel].list[idxOne] = lemonyFresh[channel].list[idxTwo]
    lemonyFresh[channel].list[idxTwo] = value

    bot.say(chatroom, `Swapped #${idxOne} and #${idxTwo} in ${listName}! ${positiveEmote}`)
}

function moveItems(bot, chatroom, args) {
    logMessage([`-> moveItems(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const listName = lemonyFresh[channel].list[0] || `the list`
    const positiveEmote = getPositiveEmote(channel)
    const neutralEmote = getNeutralEmote(channel)
    const negativeEmote = getNegativeEmote(channel)

    if (args.length < 3) {
        bot.say(chatroom, `Please provide two numbers: the current position and its new position! ${neutralEmote}`)
        return
    }

    const idxOne = Number(args[1])
    const idxTwo = Number(args[2])
    // Either index is NaN, zero, or doesn't exist in array
    if (!idxOne || !lemonyFresh[channel].list[idxOne]) { return bot.say(chatroom, `${args[1] ? `#${args[1]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }
    if (!idxTwo || !lemonyFresh[channel].list[idxTwo]) { return bot.say(chatroom, `${args[2] ? `#${args[2]}` : `Item`} not found in ${listName}! ${negativeEmote}`) }

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

function renameList(bot, chatroom, args) {
    logMessage([`-> renameList(args: '${args.join(`', '`)}')`])
    const channel = chatroom.substring(1)
    const neutralEmote = getNeutralEmote(channel)
    const positiveEmote = getPositiveEmote(channel)

    const currentName = lemonyFresh[channel].list[0]
    const newName = args.slice(1).join(` `)
    if (currentName === newName) { return bot.say(chatroom, `List name is already ${currentName ? `"${currentName}"` : `blank`}! ${neutralEmote}`) }
    lemonyFresh[channel].list[0] = newName
    bot.say(chatroom, `List name ${newName ? `updated ${currentName ? `from "${currentName}" ` : ``}to "${newName}"` : `has been reset from "${currentName}"`}! ${positiveEmote}`)
}

function clearList(bot, chatroom, resetName) {
    logMessage([`-> clearList(resetName? ${resetName})`])
    const channel = chatroom.substring(1)
    const positiveEmote = getPositiveEmote(channel)

    lemonyFresh[channel].list.length = 1
    if (resetName) { lemonyFresh[channel].list[0] = `` }
    const listName = lemonyFresh[channel].list[0] || `The list`

    bot.say(chatroom, `${listName} has been ${resetName ? `reset` : `cleared`}! ${positiveEmote}`)
}

function getListMethods(bot, chatroom, isModOrVIP) {
    logMessage([`-> getListMethods(isModOrVIP? ${isModOrVIP})`])
    const channel = chatroom.substring(1)
    const neutralEmote = getNeutralEmote(channel)

    isModOrVIP
        ? bot.say(chatroom, `You can use !list to show the full list, or !list <number> or "random" to get a specific or random item from the list! VIPs/mods can also use !list add <new item>, edit <number>, delete <number>, swap/switch <number1> <number2>, move <number1> <number2>, name/rename <list name>, clear (to empty list), and reset (to empty list and reset name)! ${neutralEmote}`)
        : bot.say(chatroom, `You can use !list to show the full list, or !list <number> or "random" to get a specific or random item from the list! ${neutralEmote}`)
}

module.exports = {
    useList(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> useList(channel: '${channel}', listName: '${lemonyFresh[channel].list[0]}', items: ${lemonyFresh[channel].list.slice(1).length}, args:`, `'${args.join(`', '`)}')`])

        // Get list of all methods
        if (/^help$/i.test(args[0])) { return getListMethods(bot, chatroom, isModOrVIP) }

        // Get item by number
        if (/^-?\d+$/i.test(args[0])) { return getItem(bot, chatroom, Number(args[0])) }

        // Get random item
        if (/^random$/i.test(args[0])) { return getItem(bot, chatroom, Math.ceil(Math.random() * (lemonyFresh[channel].list.length - 1))) }

        // Add item to list
        if (/^add$/i.test(args[0])) { return addItem(bot, chatroom, args) }

        // Edit item in list
        if (/^edit$/i.test(args[0])) { return editItem(bot, chatroom, args) }

        // Swap/switch items in list
        if (/^swap$|^switch$/i.test(args[0])) { return swapItems(bot, chatroom, args) }

        // Move items in list
        if (/^move$/i.test(args[0])) { return moveItems(bot, chatroom, args) }

        // Delete item from list
        if (/^delete$/i.test(args[0])) { return deleteItem(bot, chatroom, args) }

        // Name/rename list
        if (/^(re)?name$/i.test(args[0])) { return renameList(bot, chatroom, args) }

        // Clear list contents
        if (/^clear$/i.test(args[0])) { return clearList(bot, chatroom, false) }

        // Clear list contents and reset name
        if (/^reset$/i.test(args[0])) { return clearList(bot, chatroom, true) }

        // No args, or keyword not recognized
        const listContents = lemonyFresh[channel].list.map((el, idx) => `${idx}) ${el}`)
        listContents.shift()
        const dumbEmote = getDumbEmote(channel)

        listContents.length
            ? bot.say(chatroom, `${lemonyFresh[channel].list[0] || `Here's the list`}: ${listContents.join(`, `)}`)
            : bot.say(chatroom, `No items are in ${lemonyFresh[channel].list[0] || `the list`}! ${dumbEmote}`)
    }
}

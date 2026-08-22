const BOT_USERNAME = process.env.BOT_USERNAME

const { users } = require(`../data`)
const { logMessage } = require(`../utils`)

const data = {
    fightTimer: 0,
    lv: 0,
    hp: 0,
    weapon: ``,
    armor: ``,
    gold: 0,
    items: []
}

const parseUsername = (str) => Object.keys(users).filter(user => users[user].displayName === str)[0] || str.toLowerCase()

function upgradeWeapon(bot, chatroom) {
    const weapons = [
        `Real Knife`,
        `Worn Dagger`,
        `Empty Gun`,
        `Burnt Pan`,
        `Torn Notebook`,
        `Ballet Shoes`,
        `Tough Glove`,
        `Toy Knife`,
        `Stick`
    ]
    const userWeapons = [...data.items.filter(el => weapons.includes(el))]
    const bestWeapon = weapons.filter(weapon => userWeapons.includes(weapon))[0]
    if (bestWeapon && data.weapon !== bestWeapon) {
        setTimeout(() => bot.say(chatroom, `!equip ${bestWeapon}`), 2000)
    }
}

function upgradeArmor(bot, chatroom) {
    const allArmor = [
        `The Locket`,
        `Heart Locket`,
        `Cowboy Hat`,
        `Stained Apron`,
        `Temmie Armor`,
        `Cloudy Glasses`,
        `Old Tutu`,
        `Manly Bandanna`,
        `Faded Ribbon`,
        `Bandage`
    ]
    const userArmor = [...data.items.filter(el => allArmor.includes(el))]
    const bestArmor = allArmor.filter(armor => userArmor.includes(armor))[0]
    if (bestArmor && data.weapon !== bestArmor) {
        setTimeout(() => bot.say(chatroom, `!equip ${bestArmor}`), 2000)
    }
}

module.exports = {
    parseSelfData(props, regex) {
        logMessage([`> parseSelfData()`])
        const { bot, chatroom, message } = props
        data.lv = Number(message.split(regex)[1])
        data.hp = Number(message.split(regex)[2])
        data.weapon = message.split(regex)[3]
        data.armor = message.split(regex)[4]
        data.gold = Number(message.split(regex)[5])
        upgradeWeapon(bot, chatroom)
        setTimeout(() => upgradeArmor(bot, chatroom), 3000)
    },
    mercyUser(props, regex) {
        logMessage([`> mercyUser()`])
        const { bot, chatroom, message } = props
        const username = parseUsername(message.split(regex)[1])
        setTimeout(() => bot.say(chatroom, `!mercy ${username}`), 3000)
    },
    fightBack(props, regex) {
        logMessage([`> fightBack()`])
        const { bot, chatroom, message } = props
        const username = parseUsername(message.split(regex)[1])
        data.fightTimer = setTimeout(() => bot.say(chatroom, `!fight ${username}`), 3000)
    },
    reloadSave(props, regex) {
        logMessage([`> reloadSave()`])
        const { bot, chatroom, message } = props
        clearTimeout(data.fightTimer)
        setTimeout(() => bot.say(chatroom, `!load`), 3000)
    },
    parseVictory(props, regex) {
        logMessage([`> parseVictory()`])
        const { bot, chatroom, message } = props
        const foundGold = Number(message.split(regex)[1])
        data.gold += foundGold

        const endOfMessage = message.split(regex)[message.split(regex).length - 1]
        const levelUpRegex = new RegExp(`${BOT_USERNAME}'s LOVE increased`, `i`)
        if (levelUpRegex.test(endOfMessage)) {
            data.lv++
        }
        const earnedItemsRegex = new RegExp(`${BOT_USERNAME} found: (([a-z\\s'\\.\\?]+),?\\s?)+`, `gi`)
        if (earnedItemsRegex.test(endOfMessage)) {
            const items = endOfMessage.match(/[^\s:,][a-z\s'\.\?]+/gi).slice(3)
            items.forEach(item => data.items.push(item))
        }
        upgradeWeapon(bot, chatroom)
        setTimeout(() => upgradeArmor(bot, chatroom), 3000)
    },
    parseInventory(props, regex) {
        logMessage([`> parseInventory()`])
        const { bot, chatroom, message } = props
        data.items = message.match(/[^\s:,][a-z\s'\.\?]+/gi).slice(2)
        upgradeWeapon(bot, chatroom)
        setTimeout(() => upgradeArmor(bot, chatroom), 3000)
    }
}
require(`dotenv`).config()
const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import data
const { users } = require(`./data`)

// Import helper functions
const { talk } = require(`./utils`)

function useLemon(chatroom, command, username, target) {
    if (settings.debug) { console.log(`${boldTxt}> handleGiveLemon(chatroom: ${chatroom}, command: ${command}, username: ${username}, target: ${target})${resetTxt}`) }
    const user = users[username]
    const targetUser = users[target]
    const verb = command.split(/^!(.+)lemon(.*)$/)[1]
    const suffix = command.split(/^!(.+)lemon(.*)$/)[2]
    if (user.lemons === 0) { return talk(chatroom, `${user.displayName} has no lemons!`) }
    if (verb === `give`) {
        user.lemons--
        if (target) {
            targetUser.lemons++
            talk(chatroom, `${user.displayName} gave a lemon to ${targetUser.displayName}!`)
        }
        else {
            talk(chatroom, `JPEGSTRIPES gave away a lemon!`)
        }
    } else if (verb === `eat`) {
        user.lemons--
        if (target) {
            talk(chatroom, `JPEGSTRIPES ate a whole lemon while ${targetUser.displayName} watched.`)
        }
        else {
            talk(chatroom, `JPEGSTRIPES ate a whole lemon. Ack, sour!`)
        }
    } else if (verb === `make` && suffix) {
        user.lemons--
        const foodPatterns = /^(bar(s?)|cookie(s?)|tart(s?)|pie|hummus|soup|(pound|cup)?cake(s?)|trifle(s?)|muffin(s?)|roll(s?))$/
        const drinkPatterns = /^soda$|^punch$|^juice$|^hooch$|^booze$|^cider$|^water$/
        const yummySounds = [
            `Yum`,
            `Yum`,
            `Mmm`,
            `Mmm`,
            `Tasty`,
            `Delicious`
        ]
        const yummySound = yummySounds[Math.floor(Math.random() * yummySounds.length)]
        if (foodPatterns.test(suffix)) {
            if (target) {
                talk(chatroom, `${user.displayName} made ${suffix.endsWith(`s`) ? `` : `a `}lemon ${suffix}, and ${targetUser.displayName} ate ${suffix.endsWith(`s`) ? `them` : `it`}. ${yummySound}!`)
            }
            else {
                talk(chatroom, `${user.displayName} made ${suffix.endsWith(`s`) ? `` : `a `}lemon ${suffix}, and ate ${suffix.endsWith(`s`) ? `them` : `it`}. ${yummySound}!`)
            }
        } else if (drinkPatterns.test(suffix)) {
            if (target) {
                talk(chatroom, `${user.displayName} made lemon ${suffix}, and ${targetUser.displayName} drank it. ${yummySound}!`)
            }
            else {
                talk(chatroom, `${user.displayName} made lemon ${suffix}, and drank it. ${yummySound}!`)
            }
        } else if (/^ade$/.test(suffix)) {
            if (target) {
                talk(chatroom, `${user.displayName} made lemonade from lemons, and ${targetUser.displayName} drank it. Such is life.`)
            }
            else {
                talk(chatroom, `${user.displayName} made lemonade from lemons and drank it. Such is life.`)
            }
        } else if (/^meringuepie$/.test(suffix)) {
            if (target) {
                talk(chatroom, `${user.displayName} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. ${targetUser.displayName.substring(0, 1).toUpperCase() + targetUser.displayName.substring(1)} ate it. ${yummySound}!`)
            }
            else {
                talk(chatroom, `${user.displayName} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. Then they ate it. ${yummySound}!`)
            }
        } else {
            if (target) {
                talk(chatroom, `${user.displayName} made lemon ${suffix}, and ${targetUser.displayName} consumed it. ${yummySound}!`)
            }
            else {
                talk(chatroom, `${user.displayName} made lemon ${suffix}, and consumed it. ${yummySound}!`)
            }
        }
    } else if (verb === `throw`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} threw a lemon at ${targetUser.displayName}'s head! Ouch!`)
        }
        else {
            talk(chatroom, `${user.displayName} yeeted away a lemon! Goodbye!`)
        }
    } else if (verb === `smash`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} smashed a lemon into oblivion, and ${targetUser.displayName} watched.`)
        }
        else {
            talk(chatroom, `${user.displayName} smashed a lemon into oblivion!`)
        }
    } else if (verb === `slice`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} sliced a lemon into multiple pieces, but ${targetUser.displayName} knocked them on the floor!`)
        }
        else {
            talk(chatroom, `${user.displayName} sliced a lemon into several pieces. They fell on the floor!`)
        }
    } else if (verb === `juice`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} juiced a lemon and ${targetUser.displayName} drank it. Ack, sour!`)
        }
        else {
            talk(chatroom, `${user.displayName} juiced a lemon and drank it. Ack, sour!`)
        }
    } else if (verb === `zest`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} zested a lemon onto ${targetUser.displayName}'s head. Cute!`)
        }
        else {
            talk(chatroom, `${user.displayName} zested a lemon, and threw the rest away.`)
        }
    } else if (verb === `peel`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} peeled a lemon and gave it to ${targetUser.displayName}. They didn't know what to do with it, so they threw it away.`)
        }
        else {
            talk(chatroom, `${user.displayName} peeled a lemon, and threw the rest away.`)
        }
    } else if (verb === `carve`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} carved ${targetUser.displayName}'s face into a jack-o'-lemon! 🎃️`)
        }
        else {
            talk(chatroom, `${user.displayName} carved a lemon into a cute jack-o'-lemon! 🎃️`)
        }
    } else if (verb === `smoke`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} smoked out of a lemon and passed it to ${targetUser.displayName}.`)
        }
        else {
            talk(chatroom, `${user.displayName} carved a lemon into a pipe and smoked out of it. Wow!`)
        }
    } else if (verb === `kick`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} kicked a lemon over ${targetUser.displayName}'s head. Wow!`)
        }
        else {
            talk(chatroom, `${user.displayName} punted a lemon across the room!`)
        }
    } else if (verb === `bite`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} made ${targetUser.displayName} take a bite out of their lemon. Ack, sour!`)
        }
        else {
            talk(chatroom, `${user.displayName} took a bite out of a lemon. Ack, sour!`)
        }
    } else if (verb === `punch`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} punched a lemon towards ${targetUser.displayName}, and it rolled onto the floor.`)
        }
        else {
            talk(chatroom, `${user.displayName} punched a lemon. It rolled away.`)
        }
    } else if (verb === `keep`) {
        if (target) {
            talk(chatroom, `${user.displayName} is holding on to their lemon and making ${targetUser.displayName} jealous.`)
        }
        else {
            talk(chatroom, `${user.displayName} decided to keep their lemon. They'll cherish it forever.`)
        }
    } else if (verb === `show`) {
        if (target) {
            talk(chatroom, `${user.displayName} shows their ${user.lemons === 1 ? ``: `${user.lemons} `}lemon${user.lemons === 1 ? ``: `s`} to ${targetUser.displayName}!`)
        }
        else {
            talk(chatroom, `${user.displayName} shows everyone their ${user.lemons === 1 ? ``: `${user.lemons} `}lemon${user.lemons === 1 ? ``: `s`}!`)
        }
    } else if (verb === `forget`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} asked ${targetUser.displayName} to watch their lemon, and they forgot to. It disappeared.`)
        }
        else {
            talk(chatroom, `${user.displayName} forgot about their lemon. It vanished into thin air.`)
        }
    } else if (verb === `drop`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} dropped a lemon on ${targetUser.displayName}'s foot, and it rolled away.`)
        }
        else {
            talk(chatroom, `${user.displayName} dropped a lemon on the floor, and it rolled away.`)
        }
    } else if (verb === `burn`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} set fire to a lemon and watched it burn with ${targetUser.displayName}.`)
        }
        else {
            talk(chatroom, `${user.displayName} set fire to a lemon and watched it burn to the ground.`)
        }
    } else if (verb === `kill`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} killed a lemon, and ${targetUser.displayName} decided not to call the police.`)
        }
        else {
            talk(chatroom, `${user.displayName} killed a lemon, and it died.`)
        }
    } else if (verb === `donate`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} donated a lemon to ${targetUser.displayName} in their time of need.`)
        }
        else {
            talk(chatroom, `${user.displayName} donated a lemon to someone in their time of need.`)
        }
    } else if (verb === `teach`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} and ${targetUser.displayName} raised a lemon. It left the nest and lived a fulfilling life.`)
        }
        else {
            talk(chatroom, `${user.displayName} educated a lemon about the ways of life. It went off to study at a prestigious university.`)
        }
    } else if (verb === `plant`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} and ${targetUser.displayName} planted a lemon in the ground, in hopes that it would grow into a tree.`)
        }
        else {
            talk(chatroom, `${user.displayName} planted a lemon in the ground, in hopes that it would grow into a tree.`)
        }
    } else if (verb === `scold`) {
        user.lemons--
        if (target) {
            talk(chatroom, `${user.displayName} and ${targetUser.displayName} bullied a lemon. It rolled away in shame.`)
        }
        else {
            talk(chatroom, `${user.displayName} scolded a lemon. It rolled away in shame.`)
        }
    } else {
        user.lemons--
        const nullOutcomes = [
            `exploded`,
            `blew away`,
            `disappeared`,
            `vanished into thin air`,
            `evaporated`,
            `rolled away`,
            `melted`
        ]
        const nullOutcome = nullOutcomes[Math.floor(Math.random() * nullOutcomes.length)]
        if (target) {
            talk(chatroom, `${user.displayName} tried to ${verb} a lemon with ${targetUser.displayName}, but it ${nullOutcome}. Whoops!`)
        }
        else {
            talk(chatroom, `${user.displayName} tried to ${verb} a lemon, but it ${nullOutcome}. Whoops!`)
        }
    }
}

module.exports = { useLemon }

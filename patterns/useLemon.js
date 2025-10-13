const BOT_USERNAME = process.env.BOT_USERNAME
const { lemonyFresh, users } = require(`../data`)
const { logMessage, pluralize, coinFlip } = require(`../utils`)

function stealLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
                return
            }
            const randomChance = Math.floor(Math.random() * 50)
            if (randomChance) {
                bot.say(chatroom, `${userNickname} tried to steal ${targetNickname}'s lemons, but it didn't work!`)
            } else {
                user.lemons += target.lemons
                target.lemons = 0
                bot.say(chatroom, `${userNickname} managed to steal ALL of ${targetNickname}'s lemons!`)
            }
        } else {
            bot.say(chatroom, `${userNickname} ran off with all ${user.lemons} of their own lemons! What a steal!`)
        }
    } else {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
                return
            }
            const randomChance = Math.floor(Math.random() * 20)
            if (randomChance) {
                bot.say(chatroom, `${userNickname} tried to steal a lemon from ${targetNickname}, but it didn't work!`)
            } else {
                user.lemons++
                target.lemons--
                bot.say(chatroom, `${userNickname} managed to steal a lemon from ${targetNickname}!`)
            }
        } else {
            bot.say(chatroom, `${userNickname} very stealthily ran off with a lemon... It was their own lemon.`)
        }
    }
}
function createLemon(bot, chatroom, user, suffix, target) {
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    const randomChance = Math.floor(Math.random() * 20)
    randomChance
        ? target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to create a lemon for ${targetNickname}, but it didn't work!`)
                : bot.say(chatroom, `${userNickname} tried to generate a lemon for ${targetNickname}, but it didn't work!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to make a lemon out of thin air, but it didn't work!`)
                : bot.say(chatroom, `${userNickname} tried to manifest a lemon, but it didn't work!`)
        : target
            ? (target.lemons++, coinFlip())
                ? bot.say(chatroom, `${userNickname} somehow managed to create a lemon for ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} somehow managed to generate a lemon for ${targetNickname}!`)
            : (user.lemons++, coinFlip())
                ? bot.say(chatroom, `${userNickname} somehow managed to create a lemon out of thin air!`)
                : bot.say(chatroom, `${userNickname} suser.lemons--
        targetomehow managed to manifest a lemon!`)
}
function giveLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            target.lemons += user.lemons
            user.lemons = 0
            bot.say(chatroom, `${userNickname} gave all their lemons to ${targetNickname}!`)
            return
        } else {
            user.lemons = 0
            coinFlip()
                ? bot.say(chatroom, `${userNickname} gave away all their lemons!`)
                : bot.say(chatroom, `${userNickname} lost all their lemons into the void!`)
        }
    } else {
        user.lemons--
        if (target) {
            target.lemons++
            coinFlip()
                ? bot.say(chatroom, `${userNickname} gave a lemon to ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} gave ${targetNickname} a lemon!`)
        } else {
            coinFlip()
                ? bot.say(chatroom, `${userNickname} gave away a lemon!`)
                : bot.say(chatroom, `${userNickname} gave a lemon to nobody.`)
        }
    }
}
function eatLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} ate all the lemons while ${targetNickname} watched!`)
                : bot.say(chatroom, `${userNickname} fed all their lemons to ${targetNickname}!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} ate all their lemons and became powerful.`)
                : bot.say(chatroom, `${userNickname} ate all their lemons to gain their strength.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} ate a whole lemon while ${targetNickname} watched.`)
                : bot.say(chatroom, `${userNickname} fed a whole lemon to ${targetNickname}.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} ate a whole lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} ate a whole lemon. Eww, bitter!`)
}
function makeLemon(bot, chatroom, user, suffix, target, verb) {
    const allLemons = [`s`, `z`].includes(suffix)
    const plural = suffix.endsWith(`s`) || suffix.endsWith(`z`)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (!suffix || allLemons) {
        if (allLemons) {
            target
                ? coinFlip()
                    ? (user.lemons = 0, bot.say(chatroom, `${userNickname} went to ${verb} all ${user.lemons} of their lemons into little ${targetNickname}s. They marched away!`))
                    : bot.say(chatroom, `${targetNickname} tried to ${verb} all of ${userNickname}'s lemons into... lemons. They gave them back!`)
                : coinFlip()
                    ? (user.lemons = 0, bot.say(chatroom, `${userNickname} tried to ${verb} with their lemons. And now they're all used up?`))
                    : bot.say(chatroom, `${userNickname} went to ${verb} their lemons into... more lemons. Nothing changed!`)
        } else if (!suffix) {
            target
                ? coinFlip()
                    ? (user.lemons--, bot.say(chatroom, `${userNickname} went to ${verb} a lemon into a little ${targetNickname}. It said "goodbye"!`))
                    : bot.say(chatroom, `${targetNickname} tried to ${verb} a lemon out of ${userNickname}'s lemon. They handed it back!`)
                : coinFlip()
                    ? (user.lemons--, bot.say(chatroom, `${userNickname} spent one lemon to "${verb}". And now it's gone?`))
                    : bot.say(chatroom, `${userNickname} successfully tried to ${verb} a lemon out of their lemon. It is the perpetual lemon cycle.`)
        }
    } else {
        user.lemons--
        const foodPatterns = /^(bar(s?)|cookie(s?)|tart(s?)|pie|hummus|soup|(pound|cup)?cake(s?)|trifle(s?)|muffin(s?)|roll(s?))$/
        const drinkPatterns = /^soda$|^punch$|^juice$|^hooch$|^booze$|^cider$|^water$|^tea$/
        const yummySounds = [
            `Yum`,
            `Yum`,
            `Yummy`,
            `Yummy`,
            `Mmm`,
            `Mmmmmmm`,
            `Mmmmmmmmmmm`,
            `Tasty`,
            `Tasty`,
            `Tasty`,
            `Delicious`,
            `Delicious`,
            `Exquisite`
        ]
        const yummySound = yummySounds[Math.floor(Math.random() * yummySounds.length)]
        if (foodPatterns.test(suffix)) {
            target
                ? coinFlip()
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} watched them eat ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} ate ${plural ? `them` : `it`}. ${yummySound}!`)
                : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ate ${plural ? `them` : `it`}. ${yummySound}!`)
        } else if (drinkPatterns.test(suffix)) {
            target
                ? coinFlip()
                    ? bot.say(chatroom, `${userNickname} made lemon ${suffix}, and ${targetNickname} watched them drink it. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made lemon ${suffix}, and ${targetNickname} drank it. ${yummySound}!`)
                : bot.say(chatroom, `${userNickname} made lemon ${suffix}, and drank it. ${yummySound}!`)
        } else if (/^ade$/.test(suffix)) {
            target
                ? bot.say(chatroom, `${userNickname} made lemonade from lemons, and ${targetNickname} drank it. Such is life.`)
                : bot.say(chatroom, `${userNickname} made lemonade from lemons and drank it. Such is life.`)
        } else if (/^meringuepie$/.test(suffix)) {
            target
                ? bot.say(chatroom, `${userNickname} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. ${targetNickname.substring(0, 1).toUpperCase() + targetNickname.substring(1)} ate it. ${yummySound}!`)
                : bot.say(chatroom, `${userNickname} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. Then they ate it. ${yummySound}!`)
        } else {
            target
                ? coinFlip()
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} consumed ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} watched them consume ${plural ? `them` : `it`}. ${yummySound}!`)
                : coinFlip()
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and consumed ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, but ${plural ? `they` : `it`} fell on the floor... ${yummySound}!`)
        }
    }
}
function throwLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} threw all their lemons at ${targetNickname}! Ouch!`)
                : bot.say(chatroom, `${userNickname} pelted all their lemons at ${targetNickname} as hard as they could!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} threw away their lemons!`)
                : bot.say(chatroom, `${userNickname} yeeted all their lemons away! Goodbye!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} threw a lemon at ${targetNickname}'s head! Ouch!`)
                : bot.say(chatroom, `${userNickname} threw a lemon at the back of ${targetNickname}'s head! Ouch!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} threw a lemon as far as they could!`)
                : bot.say(chatroom, `${userNickname} yeeted a lemon! Goodbye!`)
}
function discardLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} watch them toss all their lemons into the trash!`)
                : bot.say(chatroom, `${userNickname} made all their lemons magically disappear - ${targetNickname} looks amazed.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tossed all their lemons in to a garbage can!`)
                : bot.say(chatroom, `${userNickname} said "Ctrl+A, Delete" to all their lemons.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} watch them dispose of a lemon.`)
                : bot.say(chatroom, `${userNickname} threw away a lemon like it meant nothing to them - ${targetNickname} looks on.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tossed a lemon into the trash!`)
                : bot.say(chatroom, `${userNickname} discarded a lemon.`)
}
function smashLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} destroyed all of ${userNickname}'s lemons!`)
                : bot.say(chatroom, `${targetNickname} pulverized all of ${userNickname}'s lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} destroyed all their lemons!`)
                : bot.say(chatroom, `${userNickname} pulverized all their lemons!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} obliterated ${userNickname}'s lemon!`)
                : bot.say(chatroom, `${targetNickname} busted ${userNickname}'s lemon!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} obliterated a lemon!`)
                : bot.say(chatroom, `${userNickname} busted a lemon!`)
}
function flattenLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} flattened all of ${userNickname}'s lemons!`)
                : bot.say(chatroom, `${targetNickname} smooshed all of ${userNickname}'s lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} steamrolled all their lemons!`)
                : bot.say(chatroom, `${userNickname} flattened all their lemons with a rolling pin!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} sat on ${userNickname}'s lemon!`)
                : bot.say(chatroom, `${targetNickname} squashed ${userNickname}'s lemon!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} flattened a lemon!`)
                : bot.say(chatroom, `${userNickname} smooshed a lemon!`)
}
function sliceLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} sliced up all their lemons, and showered ${targetNickname} with them!`)
                : bot.say(chatroom, `${targetNickname} chopped up all ${userNickname}'s lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} sliced up all their lemons into wheels and threw them like frisbees!`)
                : bot.say(chatroom, `${userNickname} cut up all their lemons into tiny pieces!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} sliced a lemon into multiple pieces, but ${targetNickname} knocked them on the floor!`)
                : bot.say(chatroom, `${targetNickname} chopped up ${userNickname}'s lemon into tiny pieces!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} sliced a lemon into several pieces. They fell on the floor!`)
                : bot.say(chatroom, `${userNickname} cut up lemon into tiny pieces!`)
}
function juiceLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} juiced all their lemons and ${targetNickname} drank them. Eww, bitter!`)
                : bot.say(chatroom, `${userNickname} juiced all their lemons and ${targetNickname} drank them. Mmm, refreshing!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} juiced all their lemons and drank them. Eww, bitter!`)
                : bot.say(chatroom, `${userNickname} juiced all their lemons and drank them. Mmm, refreshing!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} juiced a lemon and ${targetNickname} drank it. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} juiced a lemon and ${targetNickname} drank it. Mmm, sweet!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} juiced a lemon and drank it. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} juiced a lemon and drank it. Mmm, sweet!`)
}
function zestLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} zested all their lemons onto ${targetNickname} until they were burined underneath. Nice!`)
                : bot.say(chatroom, `${targetNickname} grated up all ${userNickname}'s lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} zested all their lemons, and threw them away!`)
                : bot.say(chatroom, `${userNickname} grated up all their lemons!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} zested a lemon onto ${targetNickname}'s head. Cute!`)
                : bot.say(chatroom, `${targetNickname} grated up ${userNickname}'s lemon.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} zested a lemon, and threw the rest away.`)
                : bot.say(chatroom, `${userNickname} grated up a lemon until it was all gone.`)
}
function peelLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? bot.say(chatroom, `${userNickname} peeled all their lemons and gave them to ${targetNickname}! They threw them away.`)
            : bot.say(chatroom, `${userNickname} peeled all their lemons, and threw them away!`)
        : (user.lemons--, target)
            ? bot.say(chatroom, `${userNickname} peeled a lemon and gave it to ${targetNickname}. They threw it away.`)
            : bot.say(chatroom, `${userNickname} peeled a lemon, and threw the rest away.`)
}
function wearLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? coinFlip()
                ? (user.lemons = 0,
                    bot.say(chatroom, `${userNickname} put all their lemons on ${targetNickname}'s head. Oh no, they fell everywhere and rolled away!`)
                )
                : bot.say(chatroom, `${userNickname} put all their lemons on their head! ${targetNickname} said they look stylish!`)
            : coinFlip()
                ? (user.lemons = 0,
                    bot.say(chatroom, `${userNickname} put all their lemons on their head. Oops, they fell off and rolled away!`)
                )
                : bot.say(chatroom, `${userNickname} put all their lemons on their head! Fancy!`)
        : target
            ? coinFlip()
                ? (user.lemons--,
                    bot.say(chatroom, `${userNickname} tried to balance a lemon on ${targetNickname}'s head. It fell off and rolled away...`)
                )
                : bot.say(chatroom, `${userNickname} put a lemon on ${targetNickname}'s head for a quick photo! They gave it back`)
            : coinFlip()
                ? (user.lemons--,
                    bot.say(chatroom, `${userNickname} tried to wear a lemon like a shoe, but they crushed it...`)
                )
                : bot.say(chatroom, `${userNickname} wore a lemon on their head like a hat!`)
}
function sexLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? (user.lemons = 0, coinFlip())
                ? bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemons. They said "no thanks".`)
                : bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemons. They said "no thanks" (the lemons).`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to screw their lemons. One by one, the lemons awkwardly departed.`)
                : bot.say(chatroom, `${userNickname} tried to screw their lemons. The lemons said "no thanks!" and flew away.`)
        : target
            ? (user.lemons--, coinFlip())
                ? bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemon. They said "no thanks".`)
                : bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemon. It said "no thanks".`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to screw a lemon. The lemon declined and left.`)
                : bot.say(chatroom, `${userNickname} tried to screw a lemon. The lemon said "no thanks!" and flew away.`)
}
function dateLemon(bot, chatroom, user, suffix, target) {
    const singular = user.lemons === 1
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? (user.lemons = 0,
                bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with their lemons and ${targetNickname}. It didn't work out.`))
            : coinFlip()
                ? (user.lemons = 0, bot.say(chatroom, `${userNickname} proposed a relationship with their ${singular ? `lemon and a stranger` : `lemons`}. ${singular ? `The lemon` : `They`} giggled and ran away!`))
                : bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with their ${singular ? `lemon and a stranger` : `lemons`}. The lemon${singular ? `` : `s`} suggested you should just stay friends.`)
        : target
            ? (user.lemons--,
                bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with a lemon and ${targetNickname}. It didn't work out.`))
            : coinFlip()
                ? (user.lemons--,
                    bot.say(chatroom, `${userNickname} tried to ask a lemon out. It giggled and ran away!`))
                : bot.say(chatroom, `${userNickname} asked out their lemon. It suggested you just stay friends.`)
}
function investLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        const randLemons = Math.ceil(Math.random() * user.lemons * 2)
        user.lemons = 0
        if (target) {
            const sharedLemons = Math.ceil(randLemons / 2)
            coinFlip()
                ? (user.lemons += sharedLemons,
                    target.lemons += sharedLemons,
                    bot.say(chatroom, `${userNickname} invested all their lemons into ${targetNickname}'s growing business. They both got back ${sharedLemons} each!`))
                : bot.say(chatroom, `${userNickname} invested all their lemons into ${targetNickname}'s growing business! They didn't get anything back.`)
        } else {
            coinFlip()
                ? (user.lemons += randLemons,
                    bot.say(chatroom, `${userNickname} put all their lemons into the stock market. They got ${randLemons} back!`))
                : bot.say(chatroom, `${userNickname} put all their lemons into the stock market! They didn't get anything back.`)
        }
    } else {
        const randLemons = Math.ceil(Math.random() * 3)
        user.lemons--
        if (target) {
            coinFlip()
                ? (user.lemons++,
                    target.lemons++,
                    bot.say(chatroom, `${userNickname} invested a lemon into ${targetNickname}'s growing business. They each got one lemon back in return!`))
                : bot.say(chatroom, `${userNickname} invested a lemon into ${targetNickname}'s growing business! They didn't get anything back.`)
        } else {
            coinFlip()
                ? (user.lemons += randLemons,
                    bot.say(chatroom, `${userNickname} put a lemon into the stock market. They got ${randLemons} back!`))
                : bot.say(chatroom, `${userNickname} put a lemon into the stock market! They didn't get anything back.`)
        }
    }
}
function carveLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? bot.say(chatroom, `${targetNickname} carved all ${userNickname}'s lemons into jack-o'-lemons! 🎃️`)
            : bot.say(chatroom, `${userNickname} carved all their lemons into cute jack-o'-lemons! 🎃️`)
        : (user.lemons--, target)
            ? bot.say(chatroom, `${userNickname} carved ${targetNickname}'s face into a jack-o'-lemon! 🎃️`)
            : bot.say(chatroom, `${userNickname} carved a lemon into a cute jack-o'-lemon! 🎃️`)
}
function smokeLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? bot.say(chatroom, `${targetNickname} smoked all of ${userNickname}'s lemons!`)
            : bot.say(chatroom, `${userNickname} loaded all their lemons into a bong and smoked them. Cool!`)
        : (user.lemons--, target)
            ? bot.say(chatroom, `${userNickname} smoked out of a lemon and passed it to ${targetNickname}.`)
            : bot.say(chatroom, `${userNickname} carved a lemon into a pipe and smoked out of it. Wow!`)
}
function kickLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} kicked all their lemons at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} kicked their lemons one by one far over ${targetNickname}'s head. Amazing!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} kicked all their lemons in one big explosion!`)
                : bot.say(chatroom, `${userNickname} set up and kicked all their lemons away one by one!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} kicked a lemon at ${targetNickname}. Ouch!`)
                : bot.say(chatroom, `${userNickname} punted a lemon over ${targetNickname}'s head. Wow!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} punted a lemon across the room!`)
                : bot.say(chatroom, `${userNickname} kicked a lemon out the window!`)
}
function biteLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} taste each of their lemons. They were all sour!`)
                : bot.say(chatroom, `${userNickname} made ${targetNickname} taste each of their lemons. They were all sweet!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} took a small nibble from each of their lemons. They were all sour!`)
                : bot.say(chatroom, `${userNickname} took a small nibble from each of their lemons. They were all sweet!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} take a bite out of their lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} made ${targetNickname} take a bite out of their lemon. Eww, bitter!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} took a bite out of a lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} took a bite out of a lemon. Eww, bitter!`)
}
function punchLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} struck away all their lemons while ${targetNickname} watched!`)
                : bot.say(chatroom, `${targetNickname} beat each of ${userNickname}'s lemons into pulp!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} struck each of their lemons away while maniacally laughing!`)
                : bot.say(chatroom, `${userNickname} beat all their lemons into pulp!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} hit a lemon at ${targetNickname}, and it rolled onto the floor.`)
                : bot.say(chatroom, `${targetNickname} hit ${userNickname}'s lemon, and it rolled onto the floor.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} hit a lemon. It rolled away.`)
                : bot.say(chatroom, `${userNickname} struck a lemon, and it ran away in tears.`)
}
function keepLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} is holding onto all their lemons and making ${targetNickname} jealous!`)
                : bot.say(chatroom, `${userNickname} is making sure ${targetNickname} doesn't get their lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} is guarding all their lemons with their life!`)
                : bot.say(chatroom, `${userNickname} is safeguarding all their lemons for future investment!`)
        : target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} is holding on to their lemon and making ${targetNickname} jealous.`)
                : bot.say(chatroom, `${userNickname} is making sure ${targetNickname} doesn't get their lemon.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} decided to keep their lemon. They'll cherish it forever.`)
                : bot.say(chatroom, `${userNickname} is keeping their lemon safe and sound.`)
}
function showLemon(bot, chatroom, user, suffix, target) {
    const singular = user.lemons === 1
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} flaunts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} shows off their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} to ${targetNickname}!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} flaunts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} at everyone!`)
                : bot.say(chatroom, `${userNickname} puts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} on display for all to see!`)
        : target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} waves a lemon at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} shows ${targetNickname} a lemon.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} shows everyone their lemon!`)
                : bot.say(chatroom, `${userNickname} waves a lemon wildly in the air!`)
}
function forgetLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemons, but they neglected them. They all disappeared!`)
                : bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemons, but they misplaced them!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} neglected their lemons, and they vanished into thin air!`)
                : bot.say(chatroom, `${userNickname} neglected their lemons, and they disappeared!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemon, and they forgot to. It disappeared.`)
                : bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemon, but they misplaced it.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} forgot about their lemon. It vanished into thin air.`)
                : bot.say(chatroom, `${userNickname} forgot their lemon. It disappeared.`)
}
function dropLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} dropped their lemons on ${targetNickname}'s feet, and they rolled away!`)
                : bot.say(chatroom, `${userNickname}'s lemons spilled out of ${targetNickname}'s arms!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} dropped all their lemons onto the floor, and they rolled away!`)
                : bot.say(chatroom, `${userNickname} spilled all the lemons out of their wallet!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} dropped a lemon on ${targetNickname}'s foot, and it rolled away.`)
                : bot.say(chatroom, `${targetNickname} fumbled ${userNickname}'s lemon, and it rolled away.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} dropped a lemon on the floor, and it rolled away.`)
                : bot.say(chatroom, `${userNickname} released a lemon into the wild. Bye lemon!`)
}
function burnLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} set fire to their lemon collection and watched along with ${targetNickname}!`)
                : bot.say(chatroom, `${targetNickname} helped ${userNickname} burn up all their lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} set up all their lemons and started a bonfire!`)
                : bot.say(chatroom, `${userNickname} burned all their lemons in a massive inferno!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} set fire to a lemon and watched it burn with ${targetNickname}.`)
                : bot.say(chatroom, `${targetNickname} burned ${userNickname}'s lemon into ashes.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} set fire to a lemon and watched it burn to the ground.`)
                : bot.say(chatroom, `${userNickname} lit a lemon on fire, and it burned to a crisp.`)
}
function killLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} killed each of their lemons, and ${targetNickname} looked on nervously.`)
                : bot.say(chatroom, `${targetNickname} murdered all of ${userNickname}'s lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} slaughtered all their lemons!`)
                : bot.say(chatroom, `${userNickname} assassinated all their lemons!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} killed a lemon, and ${targetNickname} decided not to call the police.`)
                : bot.say(chatroom, `${targetNickname} murdered ${userNickname}'s lemon!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} killed a lemon, and it died.`)
                : bot.say(chatroom, `${userNickname} murdered a lemon!`)
}
function donateLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? (target.lemons += user.lemons,
                user.lemons = 0,
                coinFlip())
                ? bot.say(chatroom, `${userNickname} donated all their lemons to ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} gifted all their lemons to ${targetNickname}!`)
            : (user.lemons = 0, coinFlip())
                ? bot.say(chatroom, `${userNickname} donated all their lemons to a good cause!`)
                : bot.say(chatroom, `${userNickname} gifted all their lemons to a hungry family!`)
        : (user.lemons--, target)
            ? (target.lemons++, coinFlip())
                ? bot.say(chatroom, `${userNickname} donated a lemon to ${targetNickname} in their time of need.`)
                : bot.say(chatroom, `${userNickname} gifted a lemon to ${targetNickname}!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} donated a lemon to a charitable cause.`)
                : bot.say(chatroom, `${userNickname} gifted a lemon to someone in their time of need.`)
}
function teachLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} raised a family of lemons! They left the nest and lived fulfilling lives.`)
                : bot.say(chatroom, `${userNickname} and ${targetNickname} brought up a strong family of lemons! They went on to become productive members of society.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} educated a lemon about the ways of life. It went off to study at a prestigious university.`)
                : bot.say(chatroom, `${userNickname} gave life advice to their lemon. It grew to become a strong, independent lemon.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} raised a lemon. It left the nest and lived a fulfilling life.`)
                : bot.say(chatroom, `${userNickname} and ${targetNickname} taught a lemon about the ways of life. It went on to become president.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} educated a lemon about the ways of life. It went off to study at a prestigious university.`)
                : bot.say(chatroom, `${userNickname} gave life advice to their lemon. It grew to become a strong, independent lemon.`)
}
function plantLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} enlisted ${targetNickname}'s help to plant all their lemons into lemon trees!`)
                : bot.say(chatroom, `${targetNickname} buried all of ${userNickname}'s lemons underground, fertilizing the soil!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${userNickname} buried a lemon into the earth.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${targetNickname} buried ${userNickname}'s lemon underground. Nothing happened.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${userNickname} buried a lemon into the earth.`)
}
function scoldLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} mocked all their lemons until they evaporated, despite ${targetNickname} pleading them to stop!`)
                : bot.say(chatroom, `${targetNickname} bullied all of ${userNickname}'s lemons! They rolled away in shame.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} bullied a lemon. It rolled away in tears.`)
                : bot.say(chatroom, `${userNickname} mocked a lemon. It shrank until it disappeared.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} ganged up on a lemon. It rolled away in shame.`)
                : bot.say(chatroom, `${targetNickname} made fun of ${userNickname}'s lemon. It shrank until it disappeared.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} bullied a lemon. It rolled away in tears.`)
                : bot.say(chatroom, `${userNickname} mocked a lemon. It shrank until it disappeared.`)
}
function smellLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0,
            target)
            ? bot.say(chatroom, `${userNickname} made a nice fragrance out of all their lemons for ${targetNickname} to smell!`)
            : bot.say(chatroom, `All of ${userNickname}'s lemons melted into a puddle, which smelled very citrusy!`)
        : (user.lemons--,
            target)
            ? bot.say(chatroom, `${userNickname} and ${targetNickname} smelled a lemon. It nebulized into the air like a fine perfume.`)
            : bot.say(chatroom, `${userNickname} smelled a lemon. It nebulized into the air like a fine perfume.`)
}
function gambleLemon(bot, chatroom, user, suffix) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName

    allLemons
        ? coinFlip()
            ? (user.lemons *= 2,
                bot.say(chatroom, `${userNickname} gambled all their lemons, and doubled them for a total of ${user.lemons}!`))
            : (user.lemons = 0,
                bot.say(chatroom, `${userNickname} gambled all their lemons, and lost them all!`))
        : (user.lemons--, coinFlip())
            ? (user.lemons += 2,
                bot.say(chatroom, `${userNickname} gambled a lemon, and got two back!`))
            : bot.say(chatroom, `${userNickname} gambled a lemon, and lost it!`)
}
function cleanLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
            }
            coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} made all their lemons squeaky clean!`)
                : bot.say(chatroom, `${userNickname} washed off all of ${targetNickname}'s lemons, and made them sparkle!`)
        } else {
            coinFlip
                ? bot.say(chatroom, `${userNickname} lathered up all their lemons and rinsed them off.`)
                : bot.say(chatroom, `${userNickname} gave all their lemons a nice hosing off!`)
        }
    } else {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
            }
            coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} polished a lemon to a sparking sheen!`)
                : bot.say(chatroom, `${userNickname} hosed off ${targetNickname}'s lemon.`)
        } else {
            coinFlip
                ? bot.say(chatroom, `${userNickname}'s lemon has been cleansed.`)
                : bot.say(chatroom, `${userNickname} rinsed off their lemon with a hose.`)
        }
    }
}
function drinkLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to swallow all their lemons whole while ${targetNickname} watched.`)
                : bot.say(chatroom, `${userNickname} juiced all their lemons for ${targetNickname} to drink!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} put all their lemons in a bowl and slurped them up.`)
                : bot.say(chatroom, `${userNickname} blended all their lemons up and sucked it through a straw.`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} cracked open an ice-cold lemon with ${targetNickname}.`)
                : bot.say(chatroom, `${userNickname} juiced a whole lemon for ${targetNickname} to drink!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} stuck a straw into a lemon and drank it.`)
                : bot.say(chatroom, `${userNickname} cracked open an ice-cold lemon and drank it.`)
}
function viewLemon(bot, chatroom, user, suffix, target) {
    const singular = user.lemons === 1
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    allLemons
        ? target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} looks at their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} with ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} observes their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} alongside ${targetNickname}!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} stares at their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`}.`)
                : bot.say(chatroom, `${userNickname} looks very closely at their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`}.`)
        : target
            ? coinFlip()
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} look at a lemon.`)
                : bot.say(chatroom, `${userNickname} looks at ${targetNickname}'s lemon.`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} holds up their lemon and examines it.`)
                : bot.say(chatroom, `${userNickname} stares unblinkingly at their lemon.`)
}
function bounceLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (coinFlip) {
                user.lemons = 0
                bot.say(chatroom, `${userNickname} threw all their lemons on the ground, and ${targetNickname} watched them explode on impact.`)
            } else {
                bot.say(chatroom, `${targetNickname} watched ${userNickname} bounce each of their lemons off the ground and catch them.`)
            }
        } else {
            if (coinFlip) {
                user.lemons = 0
                bot.say(chatroom, `${userNickname} threw all their lemons on the ground, and they burst open.`)
            } else {
                bot.say(chatroom, `${userNickname} bounced each of their lemons off the ground and caught them!`)
            }
        }
    } else {
        if (target) {
            if (coinFlip) {
                user.lemons--
                bot.say(chatroom, `${userNickname} threw a lemon at the ground, and ${targetNickname} watched it burst.`)
            } else {
                bot.say(chatroom, `${userNickname} dribbled a lemon like a basketball! ${targetNickname} is playing defense.`)
            }
        } else {
            if (coinFlip) {
                user.lemons--
                bot.say(chatroom, `${userNickname} threw a lemon at the ground, and it busted open.`)
            } else {
                bot.say(chatroom, `${userNickname} dribbled a lemon like a basketball!`)
            }
        }
    }
}
function juggleLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (user.lemons < 3) {
                bot.say(chatroom, `${userNickname} tried to juggle their lemons, but ${pluralize(user.lemons, `lemon isn't`, `lemons aren't`)} enough to juggle with. ${targetNickname} is disappointed.`)
                return
            }
            if (coinFlip()) {
                bot.say(chatroom, `${userNickname} juggled their lemons, but dropped all ${user.lemons} of them on the floor! ${targetNickname} says, "Embarrassing!"`)
                user.lemons = 0
            } else {
                bot.say(chatroom, `${userNickname} juggled all ${user.lemons} of their lemons! ${targetNickname} says, "${user.lemons > 14
                    ? `Astounding`
                    : user.lemons > 10
                        ? `Incredible`
                        : user.lemons > 8
                            ? `Amazing`
                            : user.lemons > 6
                                ? `Awesome`
                                : user.lemons > 4
                                    ? `Cool`
                                    : `Wow`
                    }!"`)
            }
        } else {
            if (user.lemons < 3) {
                bot.say(chatroom, `${userNickname} tried to juggle their lemons, but ${pluralize(user.lemons, `lemon isn't`, `lemons aren't`)} enough to juggle with.`)
                return
            }
            if (coinFlip()) {
                bot.say(chatroom, `${userNickname} juggled their lemons, but dropped all ${user.lemons} of them on the floor! Embarrassing!`)
                user.lemons = 0
            } else {
                bot.say(chatroom, `${userNickname} juggled all ${user.lemons} of their lemons! ${user.lemons > 14
                    ? `Astounding`
                    : user.lemons > 10
                        ? `Incredible`
                        : user.lemons > 8
                            ? `Amazing`
                            : user.lemons > 6
                                ? `Awesome`
                                : user.lemons > 4
                                    ? `Cool`
                                    : `Wow`
                    }!`)
            }
        }
    } else {
        if (target) {
            coinFlip()
                ? bot.say(chatroom, `${targetNickname} watched ${userNickname} try to juggle one lemon.`)
                : bot.say(chatroom, `${targetNickname} watched ${userNickname} try to juggle one lemon.It wasn't very interesting.`)
        } else {
            coinFlip()
                ? bot.say(chatroom, `${userNickname} tried to juggle one lemon.`)
                : bot.say(chatroom, `${userNickname} tried to juggle just one lemon, but it wasn't enough.`)
        }
    }
}
function touchLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
                return
            }
            coinFlip()
                ? bot.say(chatroom, `${userNickname} brushed their hand over ${targetNickname}'s lemons!`)
                : bot.say(chatroom, `${userNickname} idly fidgeted with ${targetNickname}'s lemons.`)
        } else {
            coinFlip()
                ? bot.say(chatroom, `${userNickname} fiddled with their lemons.`)
                : bot.say(chatroom, `${userNickname} played with their lemons.`)
        }
    } else {
        if (target) {
            if (target.lemons === 0) {
                bot.say(chatroom, `${targetNickname} does not have any lemons!`)
                return
            }
            coinFlip()
                ? bot.say(chatroom, `${userNickname} poked one of ${targetNickname}'s lemons.`)
                : bot.say(chatroom, `${userNickname} picked at one of ${targetNickname}'s lemons.`)
        } else {
            coinFlip()
                ? bot.say(chatroom, `${userNickname} fidgeted with their lemon.`)
                : bot.say(chatroom, `${userNickname} idly played with a lemon.`)
        }
    }
}
function exchangeLemon(bot, chatroom, user, suffix, target) {
    const channel = chatroom.substring(1)
    const streamelementsInChat = lemonyFresh[channel].viewers.includes(`streamelements`)
    const lemonIsMod = users[BOT_USERNAME].channels[channel].mod || channel === BOT_USERNAME

    const randNum = Math.ceil(Math.random() * 50) * 100
    const exchangeRates = Array(50).fill(randNum)
    exchangeRates.push(-100)
    exchangeRates.push(0)
    exchangeRates.push(500000)
    const exchangeRate = exchangeRates[Math.floor(Math.random() * exchangeRates.length)]
    logMessage([`--> streamelementsInChat: ${streamelementsInChat}, lemonIsMod: ${lemonIsMod}, exchangeRate: ${exchangeRate}`])

    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null
    const username = Object.keys(users).filter(userData => users[userData] === user)[0]
    const targetUsername = Object.keys(users).filter(userData => users[userData] === target)[0]

    if (streamelementsInChat && lemonIsMod) {
        if (allLemons) {
            target
                ? (bot.say(chatroom, `${userNickname} exchanged their ${pluralize(user.lemons, `lemon`, `lemons`)} for ${pluralize(exchangeRate, `point`, `points`)} each to give to ${targetNickname}!`),
                    bot.say(chatroom, `!bonus ${targetUsername} ${user.lemons * exchangeRate}`))
                : (bot.say(chatroom, `${userNickname} exchanged their ${pluralize(user.lemons, `lemon`, `lemons`)} for ${pluralize(exchangeRate, `point`, `points`)} each!`),
                    bot.say(chatroom, `!bonus ${username} ${user.lemons * exchangeRate}`))
            user.lemons = 0
        } else {
            target
                ? (bot.say(chatroom, `${userNickname} exchanged a lemon to give ${targetNickname} ${pluralize(exchangeRate, `point`, `points`)}!}`),
                    bot.say(chatroom, `!bonus ${targetUsername} ${exchangeRate}`))
                : (bot.say(chatroom, `${userNickname} exchanged a lemon for ${pluralize(exchangeRate, `point`, `points`)}!`),
                    bot.say(chatroom, `!bonus ${username} ${exchangeRate}`))
            user.lemons--
        }
    } else {
        if (allLemons) {
            user.lemons = 0
            target
                ? coinFlip()
                    ? bot.say(chatroom, `${targetNickname} traded all of ${userNickname}'s lemons for a hug! :)`)
                    : bot.say(chatroom, `${targetNickname} traded all of ${userNickname}'s lemons for a firm handshake! :)`)
                : coinFlip()
                    ? bot.say(chatroom, `${userNickname} traded all their lemons for a warm smile! :)`)
                    : bot.say(chatroom, `${userNickname} traded all their lemons for a friendly nod! :)`)
        } else {
            user.lemons--
            target
                ? coinFlip()
                    ? bot.say(chatroom, `${targetNickname} traded one of ${userNickname}'s lemons for a hug! :)`)
                    : bot.say(chatroom, `${targetNickname} traded one of ${userNickname}'s lemons for a firm handshake! :)`)
                : coinFlip()
                    ? bot.say(chatroom, `${userNickname} traded a lemon for a warm smile! :)`)
                    : bot.say(chatroom, `${userNickname} traded a lemon for a friendly nod! :)`)
        }
    }
}
function tuckInLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    allLemons
        ? target
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} watched ${userNickname} tuck in each of their lemons goodnight!`)
                : bot.say(chatroom, `${targetNickname} watched as ${userNickname} put their lemons to bed and gave all ${user.lemons} of them a kiss!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tucked in each of their lemons goodnight!`)
                : bot.say(chatroom, `${userNickname} put their lemons to bed and gave all ${user.lemons} of them a kiss!`)
        : target
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} watched ${userNickname} tuck one of their lemons in goodnight!`)
                : bot.say(chatroom, `${targetNickname} watched as ${userNickname} put one of their lemons to bed and gave it a kiss!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} tucked ${user.lemons === 1 ? `their lemon` : `one of their lemons`} in goodnight!`)
                : bot.say(chatroom, `${userNickname} put one of their lemons to bed and gave it a kiss!`)
}
function loseLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName

    allLemons
        ? (user.lemons = 0, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} saw ${userNickname} lose all their lemons!`)
                : bot.say(chatroom, `${targetNickname} watched ${userNickname} lose all their lemons!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} lost all their lemons!`)
                : bot.say(chatroom, `${userNickname} misplaced all their lemons!`)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} saw ${userNickname} lose a lemon!`)
                : bot.say(chatroom, `${targetNickname} watched ${userNickname} lose a lemon!`)
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} lost a lemon!`)
                : bot.say(chatroom, `${userNickname} misplaced a lemon!`)
}
function bowlLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName
    const lostLemons = Math.floor(Math.random() * 11)
    const pins = Math.ceil(Math.random() * 10)
    allLemons
        ? target
            ? user.lemons >= 10
                ? (user.lemons -= lostLemons,
                    lostLemons === 0
                        ? bot.say(chatroom, `${targetNickname} watched ${userNickname} line up 10 lemons and not bowl over any of them!`)
                        : bot.say(chatroom, `${targetNickname} watched ${userNickname} line up 10 lemons and bowl over ${lostLemons === 10 ? `all 10` : lostLemons} of them!`)
                )
                : (bot.say(chatroom, `${targetNickname} watched ${userNickname} toss all ${user.lemons} of their lemons down the bowling lane!`), user.lemons = 0)
            : user.lemons >= 10
                ? (user.lemons -= lostLemons,
                    lostLemons === 0
                        ? bot.say(chatroom, `${userNickname} lined up 10 lemons, and didn't bowl over any of them!`)
                        : bot.say(chatroom, `${userNickname} lined up 10 lemons, and bowled over ${lostLemons === 10 ? `all 10` : lostLemons} of them!`)
                )
                : (bot.say(chatroom, `${userNickname} tossed all ${user.lemons} of their lemons down the bowling lane!`), user.lemons = 0)
        : (user.lemons--, target)
            ? coinFlip()
                ? bot.say(chatroom, `${targetNickname} watched ${userNickname} bowl a lemon down the gutter!`)
                : bot.say(chatroom, `${targetNickname} watched ${userNickname} bowl a lemon. It knocked down ${pluralize(pins, `pin`, `pins`)}${pins === 10
                    ? ` and got a strike`
                    : pins === 6 || pins === 7 || pins === 8
                        ? coinFlip()
                            ? ` and got a split`
                            : ``
                        : ``}!`
                )
            : coinFlip()
                ? bot.say(chatroom, `${userNickname} bowled a lemon, and it went in the gutter!`)
                : bot.say(chatroom, `${userNickname} bowled a lemon, and knocked down ${pluralize(pins, `pin`, `pins`)}${pins === 10
                    ? ` and got a strike`
                    : pins === 6 || pins === 7 || pins === 8
                        ? coinFlip()
                            ? ` and got a split`
                            : ``
                        : ``}!`
                )
}
function nullVerb(bot, chatroom, user, suffix, target, verb) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    const nullOutcomes = [
        `exploded`,
        `blew away`,
        `disappeared`,
        `vanished into thin air`,
        `evaporated`,
        `rolled away`,
        `melted`,
        `declined the offer`
    ]
    const nullOutcome = nullOutcomes[Math.floor(Math.random() * nullOutcomes.length)]
    if (allLemons) {
        user.lemons = 0
        target
            ? bot.say(chatroom, `${userNickname} tried to ${verb} their lemons with ${targetNickname}, but they all ${nullOutcome}. Whoops!`)
            : bot.say(chatroom, `${userNickname} tried to ${verb} their lemons, but they all ${nullOutcome}. Whoops!`)
    } else {
        user.lemons--
        target
            ? bot.say(chatroom, `${userNickname} tried to ${verb} a lemon with ${targetNickname}, but it ${nullOutcome}. Whoops!`)
            : bot.say(chatroom, `${userNickname} tried to ${verb} a lemon, but it ${nullOutcome}. Whoops!`)
    }
}

module.exports = {
    useLemon(props, splitMessage) {
        const { bot, chatroom, user, userNickname, target, targetNickname } = props
        const verb = splitMessage[1].toLowerCase()
        const suffix = splitMessage[2].toLowerCase()
        logMessage([`> useLemon(chatroom: '${chatroom}', userNickname: '${userNickname}'${suffix
            ? `, suffix: '${suffix}'`
            : ``}${targetNickname
                ? `, targetNickname: '${targetNickname}'`
                : ``}, verb: '${verb}')`
        ])

        // Stop if user doesn't have lemons, or doesn't try to steal from someone who does, or doesn't try and create one
        const theftVerbs = [`steal`, `take`, `grab`, `thieve`, `nab`, `pickpocket`, `purloin`, `abscondwith`, `loot`, `pilfer`, `runawaywith`, `runoffwith`, `makeoffwith`]
        const creationVerbs = [`create`, `manufacture`, `generate`, `manifest`, `farm`, `find`, `giveme`, `givemea`, `build`, `conceive`, `construct`, `devise`, `discover`, `forge`, `form`, `invent`, `produce`, `setup`, `spawn`, `actualize`, `beget`, `compose`, `concoct`, `constitute`, `contrive`, `effect`, `erect`, `fabricate`, `fashion`, `formulate`, `imagine`, `institute`, `procreate`]
        const cleanVerbs = [`clean`, `cleanup`, `cleanse`, `bathe`, `disinfect`, `rinse`, `soak`, `wash`, `washup`, `douse`, `drench`, `hose`, `shower`, `wet`]
        const touchVerbs = [`touch`, `feel`, `fiddle`, `fiddlewith`, `play`, `playwith`, `fidget`, `fidgetwith`, `tinker`, `tinkerwith`, `mess`, `messwith`, `toy`, `toywith`, `trifle`, `triflewith`, `grope`, `brush`, `finger`, `paw`, `thumb`, `poke`, `pokeat`, `pick`, `pickat`]
        if (user.lemons === 0
            && (!theftVerbs.includes(verb) || (theftVerbs.includes(verb) && !targetNickname))
            && (!cleanVerbs.includes(verb) || (cleanVerbs.includes(verb) && !targetNickname))
            && (!touchVerbs.includes(verb) || (touchVerbs.includes(verb) && !targetNickname))
            && !creationVerbs.includes(verb)) {
            bot.say(chatroom, `${userNickname} has no lemons!`)
            return
        }

        const keyVerbs = {
            'steal': stealLemon,
            'take': stealLemon,
            'grab': stealLemon,
            'thieve': stealLemon,
            'nab': stealLemon,
            'pickpocket': stealLemon,
            'purloin': stealLemon,
            'abscondwith': stealLemon,
            'loot': stealLemon,
            'pilfer': stealLemon,
            'runawaywith': stealLemon,
            'runoffwith': stealLemon,
            'makeoffwith': stealLemon,

            'give': giveLemon,
            'giveaway': giveLemon,
            'giveup': giveLemon,
            'bestow': giveLemon,
            'offer': giveLemon,

            'eat': eatLemon,
            'consume': eatLemon,
            'devour': eatLemon,
            'munch': eatLemon,
            'chomp': eatLemon,
            'dineon': eatLemon,
            'savor': eatLemon,

            'make': makeLemon,
            'bake': makeLemon,
            'cook': makeLemon,
            'create': makeLemon,
            'prepare': makeLemon,
            'prep': makeLemon,
            'brew': makeLemon,

            'throw': throwLemon,
            'yeet': throwLemon,
            'toss': throwLemon,
            'chunk': throwLemon,

            'discard': discardLemon,
            'delete': discardLemon,
            'getridof': discardLemon,
            'throwout': discardLemon,
            'throwaway': discardLemon,
            'abandon': discardLemon,
            'cancel': discardLemon,
            'disposeof': discardLemon,
            'ditch': discardLemon,
            'dump': discardLemon,
            'eliminate': discardLemon,
            'jettison': discardLemon,
            'reject': discardLemon,
            'remove': discardLemon,
            'renounce': discardLemon,
            'repeal': discardLemon,
            'scrap': discardLemon,
            'shed': discardLemon,
            'abdicate': discardLemon,
            'abjure': discardLemon,
            'bye': discardLemon,
            'goodbye': discardLemon,
            'adios': discardLemon,
            'banish': discardLemon,
            'chuck': discardLemon,
            'desert': discardLemon,
            'dispossess': discardLemon,
            'divorce': discardLemon,
            'eject': discardLemon,
            'expel': discardLemon,
            'forsake': discardLemon,
            'junk': discardLemon,
            'oust': discardLemon,
            'repudiate': discardLemon,
            'castaside': discardLemon,
            'doawaywith': discardLemon,
            'donewith': discardLemon,
            'partwith': discardLemon,
            'shakeoff': discardLemon,
            'sweepaway': discardLemon,
            'throwoverboard': discardLemon,
            'overboard': discardLemon,
            'tossaside': discardLemon,
            'tossaway': discardLemon,
            'writeoff': discardLemon,

            'create': createLemon,
            'manufacture': createLemon,
            'generate': createLemon,
            'manifest': createLemon,
            'farm': createLemon,
            'find': createLemon,
            'giveme': createLemon,
            'givemea': createLemon,
            'build': createLemon,
            'conceive': createLemon,
            'construct': createLemon,
            'devise': createLemon,
            'discover': createLemon,
            'forge': createLemon,
            'form': createLemon,
            'invent': createLemon,
            'produce': createLemon,
            'setup': createLemon,
            'spawn': createLemon,
            'actualize': createLemon,
            'beget': createLemon,
            'compose': createLemon,
            'concoct': createLemon,
            'constitute': createLemon,
            'contrive': createLemon,
            'effect': createLemon,
            'erect': createLemon,
            'fabricate': createLemon,
            'fashion': createLemon,
            'formulate': createLemon,
            'imagine': createLemon,
            'institute': createLemon,
            'procreate': createLemon,

            'squish': flattenLemon,
            'squash': flattenLemon,
            'flatten': flattenLemon,
            'crush': flattenLemon,
            'siton': flattenLemon,
            'steamroll': flattenLemon,
            'bulldoze': flattenLemon,
            'raze': flattenLemon,
            'smoosh': flattenLemon,
            'compress': flattenLemon,
            'deflate': flattenLemon,
            'stepon': flattenLemon,

            'smash': smashLemon,
            'slam': smashLemon,
            'destroy': smashLemon,
            'explode': smashLemon,
            'bust': smashLemon,
            'burst': smashLemon,
            'crunch': smashLemon,
            'blowup': smashLemon,
            'detonate': smashLemon,
            'obliterate': smashLemon,
            'pulverize': smashLemon,

            'slice': sliceLemon,
            'cut': sliceLemon,
            'chop': sliceLemon,
            'dice': sliceLemon,
            'fence': sliceLemon,
            'chiffonade': sliceLemon,
            'butcher': sliceLemon,

            'juice': juiceLemon,
            'pulp': juiceLemon,

            'zest': zestLemon,
            'grate': zestLemon,
            'shave': zestLemon,

            'peel': peelLemon,
            'undress': peelLemon,

            'wear': wearLemon,
            'puton': wearLemon,

            'sex': sexLemon,
            'copulatewith': sexLemon,
            'havesexwith': sexLemon,
            'fuck': sexLemon,
            'haveintercoursewith': sexLemon,
            'havesexualrelationswith': sexLemon,
            'breed': sexLemon,
            'makeloveto': sexLemon,
            'sleepwith': sexLemon,
            'fornicate': sexLemon,
            'screw': sexLemon,

            'date': dateLemon,
            'gooutwith': dateLemon,
            'marry': dateLemon,
            'woo': dateLemon,
            'court': dateLemon,
            'consortwith': dateLemon,
            'proposeto': dateLemon,

            'invest': investLemon,

            'carve': carveLemon,

            'smoke': smokeLemon,
            'puff': smokeLemon,

            'kick': kickLemon,
            'punt': kickLemon,
            'roundhousekick': kickLemon,
            'dropkick': kickLemon,

            'bite': biteLemon,
            'nibble': biteLemon,
            'try': biteLemon,
            'sample': biteLemon,
            'taste': biteLemon,

            'punch': punchLemon,
            'hit': punchLemon,
            'strike': punchLemon,
            'karatechop': punchLemon,
            'slap': punchLemon,
            'beat': punchLemon,

            'keep': keepLemon,
            'guard': keepLemon,
            'protect': keepLemon,
            'bogart': keepLemon,
            'dontuse': keepLemon,
            'notuse': keepLemon,
            'donotuse': keepLemon,

            'show': showLemon,
            'flash': showLemon,
            'wave': showLemon,
            'flaunt': showLemon,
            'expose': showLemon,
            'exhibit': showLemon,
            'display': showLemon,
            'showcase': showLemon,
            'showoff': showLemon,

            'forget': forgetLemon,
            'neglect': forgetLemon,

            'drop': dropLemon,
            'fumble': dropLemon,
            'letgoof': dropLemon,
            'release': dropLemon,
            'spill': dropLemon,

            'burn': burnLemon,
            'combust': burnLemon,
            'ignite': burnLemon,
            'light': burnLemon,
            'torch': burnLemon,

            'kill': killLemon,
            'murder': killLemon,
            'slaughter': killLemon,
            'assassinate': killLemon,
            'terminate': killLemon,

            'donate': donateLemon,
            'gift': donateLemon,

            'teach': teachLemon,
            'raise': teachLemon,
            'mentor': teachLemon,
            'guide': teachLemon,
            'advise': teachLemon,
            'educate': teachLemon,
            'parent': teachLemon,
            'takein': teachLemon,
            'bringup': teachLemon,

            'plant': plantLemon,
            'bury': plantLemon,

            'scold': scoldLemon,
            'bully': scoldLemon,
            'makefunof': scoldLemon,
            'mock': scoldLemon,
            'gangupon': scoldLemon,
            'tease': scoldLemon,
            'pointat': scoldLemon,
            'laughat': scoldLemon,
            'deride': scoldLemon,
            'insult': scoldLemon,
            'scoff': scoldLemon,
            'scoffat': scoldLemon,
            'scorn': scoldLemon,
            'taunt': scoldLemon,

            'smell': smellLemon,
            'sniff': smellLemon,
            'whiff': smellLemon,
            'nebulize': smellLemon,

            'gamble': gambleLemon,
            'roulette': gambleLemon,
            'bet': gambleLemon,

            'clean': cleanLemon,
            'cleanup': cleanLemon,
            'cleanse': cleanLemon,
            'bathe': cleanLemon,
            'disinfect': cleanLemon,
            'rinse': cleanLemon,
            'soak': cleanLemon,
            'wash': cleanLemon,
            'washup': cleanLemon,
            'douse': cleanLemon,
            'drench': cleanLemon,
            'hose': cleanLemon,
            'shower': cleanLemon,
            'wet': cleanLemon,

            'drink': drinkLemon,
            'slurp': drinkLemon,
            'suck': drinkLemon,
            'gulp': drinkLemon,
            'guzzle': drinkLemon,
            'inhale': drinkLemon,
            'quaff': drinkLemon,
            'sip': drinkLemon,
            'imbibe': drinkLemon,

            'view': viewLemon,
            'lookat': viewLemon,
            'stareat': viewLemon,
            'watch': viewLemon,
            'see': viewLemon,
            'observe': viewLemon,

            'bounce': bounceLemon,
            'dribble': bounceLemon,
            'basketball': bounceLemon,
            'playbasketball': bounceLemon,
            'playbasketballwith': bounceLemon,

            'juggle': juggleLemon,

            'touch': touchLemon,
            'feel': touchLemon,
            'fiddle': touchLemon,
            'fiddlewith': touchLemon,
            'play': touchLemon,
            'playwith': touchLemon,
            'fidget': touchLemon,
            'fidgetwith': touchLemon,
            'tinker': touchLemon,
            'tinkerwith': touchLemon,
            'mess': touchLemon,
            'messwith': touchLemon,
            'toy': touchLemon,
            'toywith': touchLemon,
            'trifle': touchLemon,
            'triflewith': touchLemon,
            'grope': touchLemon,
            'brush': touchLemon,
            'finger': touchLemon,
            'paw': touchLemon,
            'thumb': touchLemon,
            'poke': touchLemon,
            'pokeat': touchLemon,
            'pick': touchLemon,
            'pickat': touchLemon,

            'currencyexchange': exchangeLemon,
            'exchange': exchangeLemon,
            'change': exchangeLemon,
            'convert': exchangeLemon,
            'trade': exchangeLemon,
            'swap': exchangeLemon,
            'barter': exchangeLemon,
            'sell': exchangeLemon,
            'resell': exchangeLemon,
            'retail': exchangeLemon,
            'merchandise': exchangeLemon,

            'tuck': tuckInLemon,
            'tuckin': tuckInLemon,

            'lose': loseLemon,
            'misplace': loseLemon,
            'miss': loseLemon,
            'mislay': loseLemon,

            'bowl': bowlLemon,
            'tenpin': bowlLemon,
        }
        if (verb in keyVerbs) {
            logMessage([`-> Matched: ${verb} lemon${suffix}:`, `[Function: ${keyVerbs[verb].name}]`])
            keyVerbs[verb](bot, chatroom, user, suffix, target, verb)
            return
        }
        logMessage([`-> Couldn't use verb: ${verb} on lemon${suffix}: `, `[Function: ${nullVerb.name}]`])
        nullVerb(bot, chatroom, user, suffix, target, verb)
    }
}

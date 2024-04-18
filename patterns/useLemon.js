// Import global settings
const { resetTxt, grayTxt, settings, inverted } = require(`../config`)

function stealLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (target.lemons === 0) { return bot.say(chatroom, `${targetNickname} does not have any lemons!`) }
            const randomChance = Math.floor(Math.random() * 50)
            if (randomChance) {
                return bot.say(chatroom, `${userNickname} tried to steal ${targetNickname}'s lemons, but it didn't work!`)
            } else {
                user.lemons += target.lemons
                target.lemons = 0
                return bot.say(chatroom, `${userNickname} managed to steal ALL of ${targetNickname}'s lemons!`)
            }
        } else {
            return bot.say(chatroom, `${userNickname} ran off with all ${user.lemons} of their own lemons! What a steal!`)
        }
    } else {
        if (target) {
            if (target.lemons === 0) { return bot.say(chatroom, `${targetNickname} does not have any lemons!`) }
            const randomChance = Math.floor(Math.random() * 20)
            if (randomChance) {
                return bot.say(chatroom, `${userNickname} tried to steal a lemon from ${targetNickname}, but it didn't work!`)
            } else {
                user.lemons++
                target.lemons--
                return bot.say(chatroom, `${userNickname} managed to steal a lemon from ${targetNickname}!`)
            }
        } else {
            return bot.say(chatroom, `${userNickname} very stealthily ran off with a lemon... It was their own lemon.`)
        }
    }
}
function giveLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            target.lemons += user.lemons
            user.lemons = 0
            return bot.say(chatroom, `${userNickname} gave all their lemons to ${targetNickname}!`)
        } else {
            user.lemons = 0
            return coinFlip
                ? bot.say(chatroom, `${userNickname} gave away all their lemons!`)
                : bot.say(chatroom, `${userNickname} lost all their lemons into the void!`)
        }
    } else {
        user.lemons--
        if (target) {
            target.lemons++
            return coinFlip
                ? bot.say(chatroom, `${userNickname} gave a lemon to ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} gave ${targetNickname} a lemon!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} gave away a lemon!`)
                : bot.say(chatroom, `${userNickname} gave a lemon to nobody.`)
        }
    }
}
function eatLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} ate all the lemons while ${targetNickname} watched!`)
                : bot.say(chatroom, `${userNickname} fed all their lemons to ${targetNickname}!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} ate all their lemons. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} ate all their lemons. Eww, bitter!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} ate a whole lemon while ${targetNickname} watched.`)
                : bot.say(chatroom, `${userNickname} fed a whole lemon to ${targetNickname}.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} ate a whole lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} ate a whole lemon. Eww, bitter!`)
        }
    }
}
function makeLemon(bot, chatroom, user, suffix, target, verb) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const plural = suffix.endsWith(`s`) || suffix.endsWith(`z`)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (!suffix || allLemons) {
        if (allLemons) {
            if (target) {
                if (coinFlip) {
                    user.lemons = 0
                    return bot.say(chatroom, `${userNickname} went to ${verb} all ${user.lemons} of their lemons into little ${targetNickname}s. They marched away!`)
                } else {
                    return bot.say(chatroom, `${targetNickname} tried to ${verb} all of ${userNickname}'s lemons into... lemons. They gave them back!`)
                }
            } else {
                if (coinFlip) {
                    user.lemons = 0
                    return bot.say(chatroom, `${userNickname} tried to ${verb} with their lemons. And now they're all used up?`)
                }
                else {
                    return bot.say(chatroom, `${userNickname} went to ${verb} their lemons into... more lemons. Nothing changed!`)
                }
            }
        } else if (!suffix) {
            if (target) {
                if (coinFlip) {
                    user.lemons--
                    return bot.say(chatroom, `${userNickname} went to ${verb} a lemon into a little ${targetNickname}. It said "goodbye"!`)
                } else {
                    return bot.say(chatroom, `${targetNickname} tried to ${verb} a lemon out of ${userNickname}'s lemon. They handed it back!`)
                }
            } else {
                if (coinFlip) {
                    user.lemons--
                    return bot.say(chatroom, `${userNickname} spent one lemon to "${verb}". And now it's gone?`)
                }
                else {
                    return bot.say(chatroom, `${userNickname} successfully tried to ${verb} a lemon out of their lemon. It is the perpetual lemon cycle.`)
                }
            }
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
            if (target) {
                return coinFlip
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} watched them eat ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} ate ${plural ? `them` : `it`}. ${yummySound}!`)
            } else {
                return bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ate ${plural ? `them` : `it`}. ${yummySound}!`)
            }
        } else if (drinkPatterns.test(suffix)) {
            if (target) {
                return coinFlip
                    ? bot.say(chatroom, `${userNickname} made lemon ${suffix}, and ${targetNickname} watched them drink it. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made lemon ${suffix}, and ${targetNickname} drank it. ${yummySound}!`)
            } else {
                return bot.say(chatroom, `${userNickname} made lemon ${suffix}, and drank it. ${yummySound}!`)
            }
        } else if (/^ade$/.test(suffix)) {
            return target
                ? bot.say(chatroom, `${userNickname} made lemonade from lemons, and ${targetNickname} drank it. Such is life.`)
                : bot.say(chatroom, `${userNickname} made lemonade from lemons and drank it. Such is life.`)
        } else if (/^meringuepie$/.test(suffix)) {
            return target
                ? bot.say(chatroom, `${userNickname} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. ${targetNickname.substring(0, 1).toUpperCase() + targetNickname.substring(1)} ate it. ${yummySound}!`)
                : bot.say(chatroom, `${userNickname} blind baked a pie crust, beat some egg yolks, cooked them with sugar, lemon juice and zest, beat the egg whites to stiff peaks, filled the pie crust with the lemon curd, topped it with meringue, and browned it in the oven. Then they ate it. ${yummySound}!`)
        } else {
            if (target) {
                return coinFlip
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} consumed ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and ${targetNickname} watched them consume ${plural ? `them` : `it`}. ${yummySound}!`)
            } else {
                return coinFlip
                    ? bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, and consumed ${plural ? `them` : `it`}. ${yummySound}!`)
                    : bot.say(chatroom, `${userNickname} made ${plural ? `` : `a `}lemon ${suffix}, but ${plural ? `they` : `it`} fell on the floor... ${yummySound}!`)
            }
        }
    }
}
function throwLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} threw all their lemons at ${targetNickname}! Ouch!`)
                : bot.say(chatroom, `${userNickname} pelted all their lemons at ${targetNickname} as hard as they could!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} threw away their lemons!`)
                : bot.say(chatroom, `${userNickname} yeeted all their lemons away! Goodbye!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} threw a lemon at ${targetNickname}'s head! Ouch!`)
                : bot.say(chatroom, `${userNickname} threw a lemon at the back of ${targetNickname}'s head! Ouch!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} threw away a lemon!`)
                : bot.say(chatroom, `${userNickname} yeeted away a lemon! Goodbye!`)
        }
    }
}
function smashLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${targetNickname} destroyed all ${userNickname}'s lemons!`)
                : bot.say(chatroom, `${targetNickname} pulverized all their${userNickname}'s lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} destroyed all their lemons!`)
                : bot.say(chatroom, `${userNickname} pulverized all their lemons!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${targetNickname} obliterated ${userNickname}'s lemon!`)
                : bot.say(chatroom, `${targetNickname} busted ${userNickname}'s lemon!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} obliterated a lemon!`)
                : bot.say(chatroom, `${userNickname} busted a lemon!`)
        }
    }
}
function sliceLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} sliced up all their lemons, and showered ${targetNickname} with them!`)
                : bot.say(chatroom, `${targetNickname} chopped up all ${userNickname}'s lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} sliced up all their lemons into wheels and threw them like frisbees!`)
                : bot.say(chatroom, `${userNickname} cut up all their lemons into tiny pieces!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} sliced a lemon into multiple pieces, but ${targetNickname} knocked them on the floor!`)
                : bot.say(chatroom, `${targetNickname} chopped up ${userNickname}'s lemon into tiny pieces!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} sliced a lemon into several pieces. They fell on the floor!`)
                : bot.say(chatroom, `${userNickname} cut up lemon into tiny pieces!`)
        }
    }
}
function juiceLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} juiced all their lemons and ${targetNickname} drank them. Eww, bitter!`)
                : bot.say(chatroom, `${userNickname} juiced all their lemons and ${targetNickname} drank them. Mmm, refreshing!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} juiced all their lemons and drank them. Eww, bitter!`)
                : bot.say(chatroom, `${userNickname} juiced all their lemons and drank them. Mmm, refreshing!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} juiced a lemon and ${targetNickname} drank it. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} juiced a lemon and ${targetNickname} drank it. Mmm, sweet!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} juiced a lemon and drank it. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} juiced a lemon and drank it. Mmm, sweet!`)
        }
    }
}
function zestLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} zested all their lemons onto ${targetNickname} until they were burined underneath. Nice!`)
                : bot.say(chatroom, `${targetNickname} grated up all ${userNickname}'s lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} zested all their lemons, and threw them away!`)
                : bot.say(chatroom, `${userNickname} grated up all their lemons!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} zested a lemon onto ${targetNickname}'s head. Cute!`)
                : bot.say(chatroom, `${targetNickname} grated up ${userNickname}'s lemon.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} zested a lemon, and threw the rest away.`)
                : bot.say(chatroom, `${userNickname} grated up a lemon until it was all gone.`)
        }
    }
}
function peelLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        return target
            ? bot.say(chatroom, `${userNickname} peeled all their lemons and gave them to ${targetNickname}! They threw them away.`)
            : bot.say(chatroom, `${userNickname} peeled all their lemons, and threw them away!`)
    } else {
        user.lemons--
        return target
            ? bot.say(chatroom, `${userNickname} peeled a lemon and gave it to ${targetNickname}. They threw it away.`)
            : bot.say(chatroom, `${userNickname} peeled a lemon, and threw the rest away.`)
    }
}
function wearLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            if (coinFlip) {
                user.lemons = 0
                return bot.say(chatroom, `${userNickname} put all their lemons on ${targetNickname}'s head. Oh no, they fell everywhere and rolled away!`)
            } else {
                return bot.say(chatroom, `${userNickname} put all their lemons on their head! ${targetNickname} said they look stylish!`)
            }
        } else {
            if (coinFlip) {
                user.lemons = 0
                return bot.say(chatroom, `${userNickname} put all their lemons on their head. Oops, they fell off and rolled away!`)
            } else {
                return bot.say(chatroom, `${userNickname} put all their lemons on their head! Fancy!`)
            }
        }
    } else {
        if (target) {
            if (coinFlip) {
                user.lemons--
                return bot.say(chatroom, `${userNickname} tried to balance a lemon on ${targetNickname}'s head. It fell off and rolled away...`)
            } else {
                return bot.say(chatroom, `${userNickname} put a lemon on ${targetNickname}'s head for a quick photo! They gave it back`)
            }
        } else {
            if (coinFlip) {
                user.lemons--
                return bot.say(chatroom, `${userNickname} tried to wear a lemon like a shoe, but they crushed it...`)
            } else {
                return bot.say(chatroom, `${userNickname} wore a lemon on their head like a hat!`)
            }
        }
    }
}
function sexLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            user.lemons = 0
            return coinFlip
                ? bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemons. They said "no thanks".`)
                : bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemons. They said "no thanks" (the lemons).`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} tried to screw their lemons. One by one, the lemons awkwardly departed.`)
                : bot.say(chatroom, `${userNickname} tried to screw their lemons. The lemons said "no thanks!" and flew away.`)
        }
    } else {
        if (target) {
            user.lemons--
            return coinFlip
                ? bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemon. They said "no thanks".`)
                : bot.say(chatroom, `${userNickname} invited ${targetNickname} to have intercourse with their lemon. It said "no thanks".`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} tried to screw a lemon. The lemon declined and left.`)
                : bot.say(chatroom, `${userNickname} tried to screw a lemon. The lemon said "no thanks!" and flew away.`)
        }
    }
}
function dateLemon(bot, chatroom, user, suffix, target) {
    const singular = user.lemons === 1
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            user.lemons = 0
            return bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with their lemons and ${targetNickname}. It didn't work out.`)
        } else {
            if (coinFlip) {
                user.lemons = 0
                return bot.say(chatroom, `${userNickname} proposed a relationship with their ${singular ? `lemon and a stranger` : `lemons`}. ${singular ? `The lemon` : `They`} giggled and ran away!`)
            } else {
                return bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with their ${singular ? `lemon and a stranger` : `lemons`}. The lemon${singular ? `` : `s`} suggested you should just stay friends.`)
            }
        }
    } else {
        if (target) {
            user.lemons--
            return bot.say(chatroom, `${userNickname} tried to enter a polygamous relationship with a lemon and ${targetNickname}. It didn't work out.`)
        } else {
            if (coinFlip) {
                user.lemons--
                return bot.say(chatroom, `${userNickname} tried to ask a lemon out. It giggled and ran away!`)
            } else {
                return bot.say(chatroom, `${userNickname} asked out their lemon. It suggested you just stay friends.`)
            }
        }
    }
}
function investLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        const randLemons = Math.floor(Math.random() * 3) + 1
        user.lemons = 0
        if (target) {
            const sharedLemons = Math.ceil(randLemons / 2)
            if (coinFlip) {
                user.lemons += sharedLemons
                target.lemons += sharedLemons
                return bot.say(chatroom, `${userNickname} invested all their lemons into ${targetNickname}'s growing business. They both got back ${sharedLemons} each!`)
            } else {
                return bot.say(chatroom, `${userNickname} invested all their lemons into ${targetNickname}'s growing business! They didn't get anything back.`)
            }
        } else {
            if (coinFlip) {
                user.lemons += randLemons
                return bot.say(chatroom, `${userNickname} put all their lemons into the stock market. They got ${randLemons} back!`)
            } else {
                return bot.say(chatroom, `${userNickname} put all their lemons into the stock market! They didn't get anything back.`)
            }
        }
    } else {
        const randLemons = Math.ceil(Math.random() * 2)
        user.lemons--
        if (target) {
            if (coinFlip) {
                user.lemons++
                target.lemons++
                return bot.say(chatroom, `${userNickname} invested a lemon into ${targetNickname}'s growing business. They each got one lemon back in return!`)
            } else {
                return bot.say(chatroom, `${userNickname} invested a lemon into ${targetNickname}'s growing business! They didn't get anything back.`)
            }
        } else {
            if (coinFlip) {
                user.lemons += randLemons
                return bot.say(chatroom, `${userNickname} put a lemon into the stock market. They got ${randLemons} back!`)
            } else {
                return bot.say(chatroom, `${userNickname} put a lemon into the stock market! They didn't get anything back.`)
            }
        }
    }
}
function carveLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        return target
            ? bot.say(chatroom, `${targetNickname} carved all ${userNickname}'s lemons into jack-o'-lemons! 🎃️`)
            : bot.say(chatroom, `${userNickname} carved all their lemons into cute jack-o'-lemons! 🎃️`)
    } else {
        user.lemons--
        return target
            ? bot.say(chatroom, `${userNickname} carved ${targetNickname}'s face into a jack-o'-lemon! 🎃️`)
            : bot.say(chatroom, `${userNickname} carved a lemon into a cute jack-o'-lemon! 🎃️`)
    }
}
function smokeLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        return target
            ? bot.say(chatroom, `${targetNickname} smoked all of ${userNickname}'s lemons!`)
            : bot.say(chatroom, `${userNickname} loaded all their lemons into a bong and smoked them. Cool!`)
    } else {
        user.lemons--
        return target
            ? bot.say(chatroom, `${userNickname} smoked out of a lemon and passed it to ${targetNickname}.`)
            : bot.say(chatroom, `${userNickname} carved a lemon into a pipe and smoked out of it. Wow!`)
    }
}
function kickLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} kicked all their lemons at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} kicked their lemons one by one far over ${targetNickname}'s head. Amazing!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} kicked all their lemons in one big explosion!`)
                : bot.say(chatroom, `${userNickname} set up and kicked all their lemons away one by one!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} kicked a lemon at ${targetNickname}. Ouch!`)
                : bot.say(chatroom, `${userNickname} punted a lemon over ${targetNickname}'s head. Wow!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} punted a lemon across the room!`)
                : bot.say(chatroom, `${userNickname} kicked a lemon out the window!`)
        }
    }
}
function biteLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} taste each of their lemons. They were all sour!`)
                : bot.say(chatroom, `${userNickname} made ${targetNickname} taste each of their lemons. They were all sweet!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} took a small nibble from each of their lemons. They were all sour!`)
                : bot.say(chatroom, `${userNickname} took a small nibble from each of their lemons. They were all sweet!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} made ${targetNickname} take a bite out of their lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} made ${targetNickname} take a bite out of their lemon. Eww, bitter!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} took a bite out of a lemon. Ack, sour!`)
                : bot.say(chatroom, `${userNickname} took a bite out of a lemon. Eww, bitter!`)
        }
    }
}
function punchLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} struck away all their lemons while ${targetNickname} watched!`)
                : bot.say(chatroom, `${targetNickname} beat each of ${userNickname}'s lemons into pulp!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} struck each of their lemons away while maniacally laughing!`)
                : bot.say(chatroom, `${userNickname} beat all their lemons into pulp!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} hit a lemon at ${targetNickname}, and it rolled onto the floor.`)
                : bot.say(chatroom, `${targetNickname} hit ${userNickname}'s lemon, and it rolled onto the floor.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} hit a lemon. It rolled away.`)
                : bot.say(chatroom, `${userNickname} struck a lemon, and it ran away in tears.`)
        }
    }
}
function keepLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} is holding onto all their lemons and making ${targetNickname} jealous!`)
                : bot.say(chatroom, `${userNickname} is making sure ${targetNickname} doesn't get their lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} is guarding all their lemons with their life!`)
                : bot.say(chatroom, `${userNickname} is safeguarding all their lemons for future investment!`)
        }
    } else {
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} is holding on to their lemon and making ${targetNickname} jealous.`)
                : bot.say(chatroom, `${userNickname} is making sure ${targetNickname} doesn't get their lemon.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} decided to keep their lemon. They'll cherish it forever.`)
                : bot.say(chatroom, `${userNickname} is keeping their lemon safe and sound.`)
        }
    }
}
function showLemon(bot, chatroom, user, suffix, target) {
    const singular = user.lemons === 1
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} flaunts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} shows off their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} to ${targetNickname}!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} flaunts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} at everyone!`)
                : bot.say(chatroom, `${userNickname} puts their ${singular ? `` : `${user.lemons} `}lemon${singular ? `` : `s`} on display for all to see!`)
        }
    } else {
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} waves a lemon at ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} shows ${targetNickname} a lemon.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} shows everyone their lemon!`)
                : bot.say(chatroom, `${userNickname} waves a lemon wildly in the air!`)
        }
    }
}
function forgetLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemons, but they neglected them. They all disappeared!`)
                : bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemons, but they misplaced them!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} neglected their lemons, and they vanished into thin air!`)
                : bot.say(chatroom, `${userNickname} neglected their lemons, and they disappeared!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemon, and they forgot to. It disappeared.`)
                : bot.say(chatroom, `${userNickname} asked ${targetNickname} to watch their lemon, but they misplaced it.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} forgot about their lemon. It vanished into thin air.`)
                : bot.say(chatroom, `${userNickname} forgot their lemon. It disappeared.`)
        }
    }
}
function dropLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} dropped their lemons on ${targetNickname}'s feet, and they rolled away!`)
                : bot.say(chatroom, `${userNickname}'s lemons spilled out of ${targetNickname}'s arms!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} dropped all their lemons onto the floor, and they rolled away!`)
                : bot.say(chatroom, `${userNickname} spilled all the lemons out of their wallet!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} dropped a lemon on ${targetNickname}'s foot, and it rolled away.`)
                : bot.say(chatroom, `${targetNickname} fumbled ${userNickname}'s lemon, and it rolled away.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} dropped a lemon on the floor, and it rolled away.`)
                : bot.say(chatroom, `${userNickname} released a lemon into the wild. Bye lemon!`)
        }
    }
}
function burnLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} set fire to their lemon collection and watched along with ${targetNickname}!`)
                : bot.say(chatroom, `${targetNickname} helped ${userNickname} burn up all their lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} set up all their lemons and started a bonfire!`)
                : bot.say(chatroom, `${userNickname} burned all their lemons in a massive inferno!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} set fire to a lemon and watched it burn with ${targetNickname}.`)
                : bot.say(chatroom, `${targetNickname} burned ${userNickname}'s lemon into ashes.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} set fire to a lemon and watched it burn to the ground.`)
                : bot.say(chatroom, `${userNickname} lit a lemon on fire, and it burned to a crisp.`)
        }
    }
}
function killLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} killed each of their lemons, and ${targetNickname} looked on nervously.`)
                : bot.say(chatroom, `${targetNickname} murdered all of ${userNickname}'s lemons!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} slaughtered all their lemons!`)
                : bot.say(chatroom, `${userNickname} assassinated all their lemons!`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} killed a lemon, and ${targetNickname} decided not to call the police.`)
                : bot.say(chatroom, `${targetNickname} murdered ${userNickname}'s lemon!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} killed a lemon, and it died.`)
                : bot.say(chatroom, `${userNickname} murdered a lemon!`)
        }
    }
}
function donateLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        if (target) {
            target.lemons += user.lemons
            user.lemons = 0
            return coinFlip
                ? bot.say(chatroom, `${userNickname} donated all their lemons to ${targetNickname}!`)
                : bot.say(chatroom, `${userNickname} gifted all their lemons to ${targetNickname}!`)
        } else {
            user.lemons = 0
            return coinFlip
                ? bot.say(chatroom, `${userNickname} donated all their lemons to a good cause!`)
                : bot.say(chatroom, `${userNickname} gifted all their lemons to a hungry family!`)
        }
    } else {
        user.lemons--
        if (target) {
            target.lemons++
            return coinFlip
                ? bot.say(chatroom, `${userNickname} donated a lemon to ${targetNickname} in their time of need.`)
                : bot.say(chatroom, `${userNickname} gifted a lemon to ${targetNickname}!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} donated a lemon to a charitable cause.`)
                : bot.say(chatroom, `${userNickname} gifted a lemon to someone in their time of need.`)
        }
    }
}
function teachLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} raised a family of lemons! They left the nest and lived fulfilling lives.`)
                : bot.say(chatroom, `${userNickname} and ${targetNickname} brought up a strong family of lemons! They went on to become productive members of society.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} educated a lemon about the ways of life. It went off to study at a prestigious university.`)
                : bot.say(chatroom, `${userNickname} gave life advice to their lemon. It grew to become a strong, independent lemon.`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} raised a lemon. It left the nest and lived a fulfilling life.`)
                : bot.say(chatroom, `${userNickname} and ${targetNickname} taught a lemon about the ways of life. It went on to become president.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} educated a lemon about the ways of life. It went off to study at a prestigious university.`)
                : bot.say(chatroom, `${userNickname} gave life advice to their lemon. It grew to become a strong, independent lemon.`)
        }
    }
}
function plantLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} enlisted ${targetNickname}'s help to plant all their lemons into lemon trees!`)
                : bot.say(chatroom, `${targetNickname} buried all of ${userNickname}'s lemons underground, fertilizing the soil!`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${userNickname} buried a lemon into the earth.`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${targetNickname} buried ${userNickname}'s lemon underground. Nothing happened.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} planted a lemon in the ground, in hopes that it would grow into a tree.`)
                : bot.say(chatroom, `${userNickname} buried a lemon into the earth.`)
        }
    }
}
function scoldLemon(bot, chatroom, user, suffix, target) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} mocked all their lemons until they evaporated, despite ${targetNickname} pleading them to stop!`)
                : bot.say(chatroom, `${targetNickname} bullied all of ${userNickname}'s lemons! They rolled away in shame.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} bullied a lemon. It rolled away in tears.`)
                : bot.say(chatroom, `${userNickname} mocked a lemon. It shrank until it disappeared.`)
        }
    } else {
        user.lemons--
        if (target) {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} and ${targetNickname} ganged up on a lemon. It rolled away in shame.`)
                : bot.say(chatroom, `${targetNickname} made fun of ${userNickname}'s lemon. It shrank until it disappeared.`)
        } else {
            return coinFlip
                ? bot.say(chatroom, `${userNickname} bullied a lemon. It rolled away in tears.`)
                : bot.say(chatroom, `${userNickname} mocked a lemon. It shrank until it disappeared.`)
        }
    }
}
function smellLemon(bot, chatroom, user, suffix, target) {
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName
    const targetNickname = target?.nickname || target?.displayName || null

    if (allLemons) {
        user.lemons = 0
        return target
            ? bot.say(chatroom, `${userNickname} made a nice fragrance out of all their lemons for ${targetNickname} to smell!`)
            : bot.say(chatroom, `All of ${userNickname}'s lemons melted into a puddle, which smelled very citrusy!`)
    } else {
        user.lemons--
        return target
            ? bot.say(chatroom, `${userNickname} and ${targetNickname} smelled a lemon. It nebulized into the air like a fine perfume.`)
            : bot.say(chatroom, `${userNickname} smelled a lemon. It nebulized into the air like a fine perfume.`)
    }
}
function gambleLemon(bot, chatroom, user, suffix) {
    const coinFlip = Math.floor(Math.random() * 2)
    const allLemons = [`s`, `z`].includes(suffix)
    const userNickname = user.nickname || user.displayName

    if (allLemons) {
        if (coinFlip) {
            user.lemons *= 2
            return bot.say(chatroom, `${userNickname} gambled all their lemons, and doubled them!`)
        } else {
            user.lemons = 0
            return bot.say(chatroom, `${userNickname} gambled all their lemons, and lost them all!`)
        }
    } else {
        user.lemons--
        if (coinFlip) {
            user.lemons += 2
            return bot.say(chatroom, `${userNickname} gambled a lemon, and got two back!`)
        } else {
            return bot.say(chatroom, `${userNickname} gambled a lemon, and lost it!`)
        }
    }
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
        return target
            ? bot.say(chatroom, `${userNickname} tried to ${verb} their lemons with ${targetNickname}, but they all ${nullOutcome}. Whoops!`)
            : bot.say(chatroom, `${userNickname} tried to ${verb} their lemons, but they all ${nullOutcome}. Whoops!`)
    } else {
        user.lemons--
        return target
            ? bot.say(chatroom, `${userNickname} tried to ${verb} a lemon with ${targetNickname}, but it ${nullOutcome}. Whoops!`)
            : bot.say(chatroom, `${userNickname} tried to ${verb} a lemon, but it ${nullOutcome}. Whoops!`)
    }
}

module.exports = {
    useLemon(props, splitMessage) {
        const { bot, chatroom, user, userNickname, target, targetNickname } = props
        const verb = splitMessage[1]
        const suffix = splitMessage[2]
        if (settings.debug) {
            console.log(`${grayTxt}> useLemon(chatroom: '${chatroom}', userNickname: '${userNickname}'${suffix
                ? `, suffix: '${suffix}'`
                : ``}${targetNickname
                    ? `, targetNickname: '${targetNickname}'`
                    : ``}, verb: '${verb}')${resetTxt}`)
        }

        // Stop if user doesn't have lemons, or doesn't try to steal from someone who does
        const theftVerbs = [`steal`, `take`, `grab`, `thieve`, `nab`, `pickpocket`, `purloin`, `abscondwith`, `loot`, `pilfer`, `runawaywith`, `runoffwith`, `makeoffwith`]
        if ((user.lemons === 0 && !theftVerbs.includes(verb))
            || (user.lemons === 0 && theftVerbs.includes(verb) && !targetNickname)) {
            return bot.say(chatroom, `${userNickname} has no lemons!`)
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
            'bestow': giveLemon,
            'offer': giveLemon,

            'eat': eatLemon,
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
            'throwaway': throwLemon,
            'yeet': throwLemon,
            'toss': throwLemon,
            'chunk': throwLemon,

            'smash': smashLemon,
            'crush': smashLemon,
            'slam': smashLemon,
            'destroy': smashLemon,
            'explode': smashLemon,
            'bust': smashLemon,
            'burst': smashLemon,
            'crunch': smashLemon,
            'squish': smashLemon,
            'smoosh': smashLemon,
            'blowup': smashLemon,
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

            'smell': smellLemon,
            'sniff': smellLemon,
            'whiff': smellLemon,
            'nebulize': smellLemon,

            'gamble': gambleLemon,
            'roulette': gambleLemon,
            'bet': gambleLemon,
        }
        if (verb in keyVerbs) {
            if (settings.debug) {
                console.log(
                    `${grayTxt}-> Matched:${resetTxt} ${inverted}${verb}${resetTxt} ${grayTxt}lemon${suffix
                        ? `${resetTxt}${inverted}${suffix}${resetTxt}${grayTxt}`
                        : ``}:${resetTxt}`,
                    keyVerbs[verb]
                )
            }
            return keyVerbs[verb](bot, chatroom, user, suffix, target, verb)
        }
        if (settings.debug) {
            console.log(`${grayTxt}-> Couldn't use verb:${resetTxt} ${inverted}${verb}${resetTxt} ${grayTxt}on lemon${suffix
                ? `${resetTxt}${inverted}${suffix}${resetTxt}${grayTxt}`
                : ``}:${resetTxt}`,
                nullVerb
            )
        }
        nullVerb(bot, chatroom, user, suffix, target, verb)
    }
}

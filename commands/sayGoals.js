const { resetTxt, grayTxt, settings } = require(`../config`)

module.exports = {
    sayGoals(props) {
        const { bot, chatroom, args, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> sayGoals(chatroom: ${chatroom}, args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }
        if (chatroom === `#sclarf`) {
            const subs = Number(args[0])
            const sclarfGoals = {
                25: `sclarf will play 3d pinball!`,
                50: `sclarf will make a food tirr list!`,
                75: `sclarf will have a fight club movie night!`,
                100: `sclarf will play hello kitty island adventure!`,
                125: `sclarf will play a 400-in-1 games console!`,
                150: `chat decidecs speedrun`,
                175: `sclarf will play just dance!`,
                200: `sclarf will do a cosplay!`,
                225: `lemony fresh stream???`,
                250: `sclarf will play Pokemon Soul Link!`,
                275: `mezcal tasting when pp`,
                300: `bianca stream`,
                325: `bianca cosplay`,
                350: `sclarf will do an art stream!`,
                375: `sclarf will have a casino night!`,
                400: `sclarf will play Pokemon Infinite fusion`,
                425: `chat pick cosplay`,
                450: `sclarf will game give away`,
                475: `big collab`,
                500: `sclarf will make a server in minecraft!`,
                525: `sclarf will play Dream Daddy or another dating sim!`,
                550: `LEGO STREAM`,
                575: `cooking adjacent goal`,
                600: `sclarf will END STREAM IMMEDIATELY`,
                625: `sclarf will Call shannon wonderwall`,
                650: `sclarf will taco bell irl stream?`,
                675: `sclarf will sexc sclarf corp calendar`,
                700: `sclarf will go see trom!`
            }
            if (!isNaN(subs) && subs in sclarfGoals) { bot.say(chatroom, `At ${subs} subs, ${sclarfGoals[subs]}`) }
        } else if (settings.debug) { console.log(`${grayTxt}${channel} has no goals${resetTxt}`) }
    }
}

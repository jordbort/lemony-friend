const API_KEY = process.env.API_KEY
const { settings, grayTxt, resetTxt } = require(`../config`)
const { handleGreetOne, sayGoodnight, sayThanks, sayYoureWelcome, sayMood } = require(`../commands/conversation`)

async function checkSentiment(props) {
    const { bot, chatroom, message } = props
    if (settings.debug) { console.log(`${grayTxt}> checkSentiment(chatroom: ${chatroom}, message: ${message})${resetTxt}`) }

    const sanitizedMsg = message.replace(/[\\{`}%^|]/g, ``)
    const endpoint = `https://api.api-ninjas.com/v1/sentiment?text=${sanitizedMsg}`
    const options = {
        headers: {
            'X-Api-Key': API_KEY
        }
    }

    const response = await fetch(endpoint, options)
    const data = await response.json()
    if (settings.debug) { console.log(data) }

    'sentiment' in data
        ? data.sentiment.includes(`NEUTRAL`)
            ? bot.say(chatroom, `:p`)
            : data.sentiment.includes(`POSITIVE`)
                ? data.sentiment.includes(`WEAK`)
                    ? bot.say(chatroom, `:)`)
                    : bot.say(chatroom, `:D`)
                : bot.say(chatroom, `:(`)
        : bot.say(chatroom, `:O`)
}

module.exports = {
    // what up
    [/\bw+h*[au]+t+( .* ?)?u+p+/i]: handleGreetOne,
    // what's up
    [/\bw+h*[au]+t+['"]*s+( .* ?)?u+p+/i]: handleGreetOne,
    // wassup
    [/\b(w+h*[au]+)?['"]*(d|s|t)+u+p+\b/i]: handleGreetOne,
    // hello
    [/\bh*[aeu]+n*l+(o+|u+r+)\b/i]: handleGreetOne,
    // hi
    [/\bh+i+\b/i]: handleGreetOne,
    // heyo
    [/\bh*[ae]+y+[ao]*\b/i]: handleGreetOne,
    // howdy
    [/\b(m+e+|h+)o+w+d+y+/i]: handleGreetOne,
    // yo
    [/\by+o+\b/i]: handleGreetOne,

    // good night
    [/\bg+o{2,}d+( .* ?)?(n+i+g+h+t+|^n+i+t+e+)/i]: sayGoodnight,
    // gn
    [/\bg+n+\b/i]: sayGoodnight,
    // bye (includes good bye)
    [/\bb+y+e+/i]: sayGoodnight,
    // goodbye
    [/\bg+o{2,}d+( .* ?)?b+y+e+/i]: sayGoodnight,

    // gj
    [/\bg+j+\b/i]: sayThanks,
    // nj
    [/\bn+j+\b/i]: sayThanks,
    // wd
    [/\bw+d+\b/i]: sayThanks,
    // good/nice job/work]
    [/\b(g+o{2,}d+|n+i+c+e+)( .* ?)?(j+o+b+|w+o+r+k+)/i]: sayThanks,
    // well done
    [/\bw+e+l{2,}( .* ?)?d+o+n+e+/i]: sayThanks,

    // ty, tysm, tyvm
    [/\bt+y+[svm]*\b/i]: sayYoureWelcome,
    // thank you
    [/\bt+h*a+n+k+( .* ?)?(y+o*u+|y+e+w+|u+)\b/i]: sayYoureWelcome,
    // thanks
    [/\bt+h*a+n+k+/i]: sayYoureWelcome,

    // how are you
    [/\bh+o+w+( .* ?)?(a+r+e+|r+)( .* ?)?(y+o+u+|u+)/i]: sayMood,
    // how're you
    [/\bh+o+w+['"]*r+e+( .* ?)?(y+o+u+|u+)/i]: sayMood,
    // hyd
    [/\bh+y+d+\b/i]: sayMood,
    // how is it going
    [/\bh+o+w+( .* ?)?i+s+( .* ?)?i+t+( .* ?)?g+o+i+n+['"g]*\b/i]: sayMood,
    // how's it going
    [/\bh+o+w+['"]*s+( .* ?)?i+t+( .* ?)?g+o+i+n+['"g]*\b/i]: sayMood,

    // Contains "you" or "u"
    [/\b(you|u)['"]*r*e*\b/i]: checkSentiment
}

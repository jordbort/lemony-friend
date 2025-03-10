const BOT_NICKNAME_REGEX = process.env.BOT_NICKNAME_REGEX

const { checkSentiment } = require(`../commands/external`)
const { handleGreetOne, sayGoodnight, sayThanks, sayYoureWelcome, sayMood, dumbReact, neutralReact, negativeReact, hypeReact } = require(`../commands/conversation`)

module.exports = {
    // good night
    [/\bg+o{2,}d+\b.*\b(n+i+g+h+t+|^n+i+t+e+)/i]: sayGoodnight,
    // gn
    [/\b(g+n+)+\b/i]: sayGoodnight,
    // bye (includes good bye)
    [/\b(b+y+e+)+/i]: sayGoodnight,
    // goodbye
    [/g+o{2,}d+ ?b+y+e+/i]: sayGoodnight,

    // gj
    [/\b(g+j+)+\b/i]: sayThanks,
    // nj
    [/\b(n+j+)+\b/i]: sayThanks,
    // wd
    [/\b(w+d+)+\b/i]: sayThanks,
    // good/nice job/work
    [/\b(g+o{2,}d+|n+i+c+e+)\b.*\b(j+o+b+|w+o+r+k+)/i]: sayThanks,
    // well done
    [/\bw+e+l{2,}\b.*\bd+o+n+e+/i]: sayThanks,
    // congrat(ulation)s
    [/c+o+n+g+r+a+t+(u+l+a+t+i+o+n+)?s+/i]: sayThanks,

    // how are you
    [/\bh+o+w+\b.*\b(a+r+e+|r+)\b.*\b(y+o+u+|u+)/i]: sayMood,
    // how're you
    [/\bh+o+w+['"]*r+e+\b.*\b(y+o+u+|u+)/i]: sayMood,
    // hru/hbu
    [/\bh+(r|b)+u+\b/i]: sayMood,
    // hyd
    [/\bh+y+d+\b/i]: sayMood,
    // how is it going
    [/\bh+o+w+\b.*\bi+s+\b.*\bi+t+\b.*\bg+o+i+n+['"g]*\b/i]: sayMood,
    // how's it going
    [/\bh+o+w+['"]*s+\b.*\bi+t+\b.*\bg+o+i+n+['"g]*\b/i]: sayMood,

    // ty, tysm, tyvm
    [/\b(t+y+[svm]*)+\b/i]: sayYoureWelcome,
    // thank you
    [/\bt+h*a+n+k+\b.*\b(y+o*u+|y+e+w+|u+)\b/i]: sayYoureWelcome,
    // thanks
    [/\bt+h*a+n+k+/i]: sayYoureWelcome,

    // what up
    [/\bw+h*[au]+t+\b.*\bu+p+/i]: handleGreetOne,
    // what's up
    [/\bw+h*[au]+t+['"]*s+\b.*\bu+p+/i]: handleGreetOne,
    // wassup
    [/\b((w+h*[au]+)?['"]*(d|s|t)+u+p+)+\b/i]: handleGreetOne,
    // hello
    [/\bh*[aeu]+n*l+(o+|u+r+)\b/i]: handleGreetOne,
    // hi
    [/\b(h+i+)+\b/i]: handleGreetOne,
    // heyo
    [/\b(h*[ae]+y+[ao]*)+\b/i]: handleGreetOne,
    // howdy
    [/\b(m+e+|h+)o+w+d+y+/i]: handleGreetOne,
    // yo
    [/\b(y+o+)+\b/i]: handleGreetOne,

    // "ok(ay) lemon"/"lemon ok(ay)"
    [RegExp(`^o+k+(a*y+)?\\s${BOT_NICKNAME_REGEX}$|^${BOT_NICKNAME_REGEX}\\so+k+(a*y+)?$`, `i`)]: dumbReact,
    // "yes lemon"/"lemon yes"
    [RegExp(`^y+e+s+\\s${BOT_NICKNAME_REGEX}$|^${BOT_NICKNAME_REGEX}\\sy+e+s+$`, `i`)]: neutralReact,
    // "no lemon"/"lemon no"
    [RegExp(`^n+o+\\s${BOT_NICKNAME_REGEX}$|^${BOT_NICKNAME_REGEX}\\sn+o+$`, `i`)]: negativeReact,

    // good bot
    [/\bg+o{2,}d+ b+ot+\b/i]: hypeReact,

    // Contains "you" or "u"
    [/\b(you|u)['"]*r*e*\b/i]: checkSentiment
}

const { checkSentiment } = require(`../commands/external`)
const { handleGreetOne, sayGoodnight, sayThanks, sayYoureWelcome, sayMood } = require(`../commands/conversation`)

module.exports = {
    // what up
    [/\bw+h*[au]+t+( .* ?)?u+p+/i]: handleGreetOne,
    // what's up
    [/\bw+h*[au]+t+['"]*s+( .* ?)?u+p+/i]: handleGreetOne,
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

    // good night
    [/\bg+o{2,}d+( .* ?)?(n+i+g+h+t+|^n+i+t+e+)/i]: sayGoodnight,
    // gn
    [/\b(g+n+)+\b/i]: sayGoodnight,
    // bye (includes good bye)
    [/\b(b+y+e+)+/i]: sayGoodnight,
    // goodbye
    [/\bg+o{2,}d+( .* ?)?b+y+e+/i]: sayGoodnight,

    // gj
    [/\b(g+j+)+\b/i]: sayThanks,
    // nj
    [/\b(n+j+)+\b/i]: sayThanks,
    // wd
    [/\b(w+d+)+\b/i]: sayThanks,
    // good/nice job/work]
    [/\b(g+o{2,}d+|n+i+c+e+)( .* ?)?(j+o+b+|w+o+r+k+)/i]: sayThanks,
    // well done
    [/\bw+e+l{2,}( .* ?)?d+o+n+e+/i]: sayThanks,

    // ty, tysm, tyvm
    [/\b(t+y+[svm]*)+\b/i]: sayYoureWelcome,
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

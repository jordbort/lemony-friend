# @lemony_friend 🍋️

Lemony Friend is a Twitch chatbot built for the Lemony Fresh streamers and their community.

## Commands
- `!docs` - Use this command to get a link to this README.
- `!commands` - This command lists all the commonly-used commands lemony_friend has.
- `!access` - This command can only be used by a member of Lemony Fresh. It is used to generate a URL for the streamer to click, to get a code for an OAuth token by following the link and authorization prompt. The redirect link is not meant to link, but the resulting URL should be copy/pasted into chat with the `!authorize` command.
- `!authorize` - This command can only be used by a member of Lemony Fresh. It should be followed by the URL created as a result of using the `!access` command and following the authorization prompt for the bot. The bot parses the text string between `code=` and `&scope=` for the code from the URL. If it is done successfully, an access token and refresh token are generated for the streamer.
- `!validate` - This command can only be used by a moderator, a VIP, or the streamer. It checks the lifespan of the channel's Twitch API access token. If it is invalid, it can be refreshed by using the `!refresh` command. If the streamer doesn't have an access token or valid refresh token, they must user the `!access` command to get a new OAuth token.
- `!refresh` - This command can only be used by a moderator, a VIP, or the streamer. It can be used to generate a renewed access token for a streamer manually, as long there is a valid refresh token. This can be used if using the `!validate` command shows a token no longer to be valid, but this isn't necessary because commands that use the access token are programmed to attempt to refresh the access token if the request doesn't go through successfully the first time.
- `!poll` - This command can only be used by a moderator or the streamer. It is used to create a poll for the channel. The syntax for this command is `!poll <seconds> / Title of the poll / Choice 1 / Choice 2` and so on. "Seconds" is a number between 15 and 1800 (thirty minutes). There must be at least two (or at most, five) choices.
- `!so` - This command gives a shoutout to another user by looking them up using the [Twitch API](https://dev.twitch.tv/docs/api/).
- `!hangman` - This command initiates a game of Hangman and chooses a random word by using the [Rando API](https://random-word-api.vercel.app/). Join the game using `!play`, even after the game has started.
- `!play` - Use this command to join an active game of Hangman.
- `!define` (or `!definition` or `!meaning`) - This command can be used followed by a word to look up its definition using an API from [API Ninjas](https://api-ninjas.com/).
- `!riddle` - This command is used to generate a riddle for the chat using an API from [API Ninjas](https://api-ninjas.com/). It can be attempted to be solved by using the `!answer` command.
- `!answer` - This command is used followed by a guess to attempt to solve the riddle.
- `!raid` - This command can only be used by a moderator, a VIP, or the streamer. It can be used to post both versions of the channel's raid message - one with sub emotes, and one without.
- `!rps` - Use this command to challenge lemony_friend to a game of Rock, Paper, Scissors. You may can use `!rps rock` `!rps paper` `!rps scissors` to specify your move, or simply use `!rps` and a move will be chosen at random.
- `!mystats` - Use this command to get the JSON data of a user.
- `!subs` - This command can be used to check lemony_friend's subscription status for all channels it is in.
- `!debug` (or `!debugmode`) - This command toggles its debug mode setting. You may also use `!debug on` or `!debug off` to specify a choice.
- `!lastmsg` - This command can be used to get a user's last message in the current channel, or use `!lastmsg <channel>` to specify a Lemony Fresh channel. 
- `!msgcount` - This command can be used to get a count of all messages sent by a user across all Lemony Fresh channels.
- `!yell` - Use this command with a message to send that message across all Lemony Fresh channels.
- `!friend` (or `!friends`) - This command can be used to get a count of all users lemony_friend knows (including itself).
- `!lemon` (or `!lemons`) - This command can be used to check how many lemons the sender (or another user) has.
- `![use]lemon[somehow?]` - This command is a wildcard that exchanges a lemon of a given user. [Use] can be any word (a verb), and [somehow?] is an optional suffix (if "lemon" is meant to be a descriptor).
- `!lemonify` - This command can be used to transform another user's message into lemons.
- `!greet` - This command can be used to greet one or more users. Use `!greet <user>` to greet one user, `!greet <user1> <user2>...` to greet multiple users, or `!greet all` to greet all known users in the current channel who have chatted in the past hour.
- `!tempcmd` (or `!tmpcmd`) - This command is used to create custom commands that will be active until the next time lemony_friend is rebooted. Use `!tempcmd <commandname> <response...>` to create/edit a command name and reply, and `!tempcmd delete <commandname>` to delete a command.
- `!tempcmds` (or `!tmpcmds`) - This command lists all existing temporary commands.
- `!goal` (or `!goals`) - This command is used followed by a number (of subscribers, dollars, etc.) to return a specific goal at that amount for that channel. This only works in channels with defined stream goals.
- `!bye` (or `!gn` or `!goodnight`) - This command can be used to say good night to a user leaving chat.
- `!color` (or `!colour`) - Use his command to get a user's chat message color.
- `!dadjoke` - This command gets a random joke from a [Dad Joke API](https://icanhazdadjoke.com/api).
- `!pokemon` - This command can be used to get useful information about a Pokémon from a [Pokémon API](https://pokeapi.co/).
- `!lurk` (or `!away` or `!brb`) - This command marks the user as "away" in the current channel. Use `!lurk <message...>` to set a custom away message. Using `!lurk` (rather than `!away` or `!brb`) does not prompt a reply from lemony_friend, opting for a quieter exit. If a user is mentioned in chat by full username while they are marked as away, lemony_friend will mention that the user is away, along with an optional away message. Upon posting in chat again, lemony_friend marks the user as unaway.

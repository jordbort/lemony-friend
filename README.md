# @lemony_friend 🍋️

Lemony Friend is a Twitch chatbot built for the Lemony Fresh streamers and their community.

## Boring commands 🍋️
- `!docs` - Use this command to get a link to this README.
- `!commands` - This command lists all the commonly-used commands lemony_friend has.
- `!access` - Use this command to get the link to Lemony Friend's authorization page. After following the prompts, the user should land on a page with a code to copy/paste into chat with the `!authorize` command. Giving access allows Lemony Friend to perform Twitch-related actions on behalf of the user, such as giving shoutouts, starting polls in chat, making announcements, etc.
- `!authorize` - This command can only be used by a streamer or moderator. It should be followed by the code created following the authorization prompts. If it is done successfully, an access token and refresh token are generated for the streamer.
- `!validate` - This command can only be used by a streamer or moderator. This command checks the lifespan of the user or channel's Twitch API access token. If it is invalid, it can be refreshed by using the `!refresh` command. If the user doesn't have an access token or valid refresh token, they must use the `!access` command to get a new OAuth token. This shouldn't be necessary to use, as lemony_friend automatically refreshes access tokens if they're found to be invalid, but could be helpful in troubleshooting.
- `!refresh` - This command can be used to generate a renewed access token for the user or streamer manually, as long there is a valid refresh token. This shouldn't be necessary to use, because commands that require the access token are programmed to attempt to refresh the access token once if the request doesn't go through successfully the first time.
- `!token` - This command can be used to refresh the bot's app access token manually. The main time this needs to be done is when the bot isn't able to access the Twitch API, such as when looking up a user's info. This shouldn't be necessary to use, as lemony_friend will attempt to refresh its token once manually if it fails the first time.

## Commands for lemony_friend info 🍋️
- `!time` - This command can be used to get the current time, optionally in a provided time zone and locale. For example, you can use `!time Australia/Sydney` to get the time in Sydney, and `!time Asia/Seoul ko-KR` to get the current time in Seoul in the Korean date and time format. By default, this command falls back on whichever time zone and locale are specified in Lemony Friend's settings.
- `!mystats` - Use this command to get the JSON data of a user.
- `!color` (or `!colour`) - Use this command to get a user's chat message color.
- `!lastmsg` - This command can be used to get a user's last message in the current channel, or use `!lastmsg <user>` to specify a different user. You can also specify a channel, as in `!lastmsg <user> <channel>`. If the specified user hasn't spoken in the specified channel, it falls back on the current channel. If the specified user isn't known to lemony_friend, it falls back on the user of the command.
- `!msgcount` - This command can be used to get a count of all messages sent by a user across all Lemony Fresh channels. Use `!msgcount <user>` to specify another user.
- `!friend` (or `!friends`) - This command can be used to get a count of all users lemony_friend knows (including itself).
- `!goal` (or `!goals`) - This command is used followed by a number (of subscribers, dollars, etc.) to return a specific goal at that amount for that channel. This only works in channels with defined stream goals.
- `!lurk` (or `!away` or `!brb`) - This command marks the user as "away" in the current channel. Use `!lurk <message...>` to set a custom away message. Using `!lurk` (rather than `!away` or `!brb`) does not prompt a reply from lemony_friend, opting for a quieter exit. If a user is mentioned in chat by username or nickname while they are marked as away, lemony_friend will mention that the user is away, along with an optional away message. Upon posting in chat again, lemony_friend marks the user as unaway. (Note: There is a 60-second grace period after being marked as away where the user can send messages or be mentioned before lemony_friend will respond. This is to minimize unwanted messages and smooth the transition away.)
- `!apply` - This is an easy way to apply pre-made nicknames to known users.
- `!online` (or `!onl`) - This command reports the time that the bot was booted up, as well as what updates have been made since the last reset.

## Mod/VIP commands 🍋️
- `!so` - This command gives a shoutout to another user by looking them up using the [Twitch API](https://dev.twitch.tv/docs/api/). If the streamer or mod using the command has given lemony_friend access to their account with `!access`, it will also attempt to give the Twitch-powered `/shoutout` to the user as well. The latter has a cooldown built into Twitch, so it will not post successfully if too many are done in succession.
- `!raid` - It can be used to post one or both versions of the channel's raid message - one with sub emotes, and one without. This can be updated through the CLI (see below).
- `!announce` - This command can only be used by the streamer or a moderator. It is used to make an announcement the channel. It will be made in the name of the streamer, unless a mod gives `!access` to Lemony Friend. The announcement will be in the primary color of the channel, unless `!announceblue`, `!announcegreen`, `!announceorange`, or `!announcepurple` are used.
- `!poll` - This command can only be used by the streamer or a moderator. It is used to create a poll for the channel. The syntax for this command is `!poll <seconds> / Title of the poll / Choice 1 / Choice 2` and so on. Spaces before/after the slashes are not required, but the slashes themselves are. "Seconds" is a number between 15 and 1800 (thirty minutes). There must be at least two (or at most, five) choices.
- `!stoppoll` - This command can only be used by the streamer or a moderator. It is used to finish the current poll before the timer runs out, and show the results.
- `!cancelpoll` - This command can only be used by the streamer or a moderator. It is used to get rid of the current poll.
- `!banuser` or `!banusers` - This command can only be used by the streamer or a moderator. It is used to ban one more users (separated by spaces) from the channel.

## Fun commands 🍋️
- `!hangman` - This command initiates a game of Hangman and chooses a random word by using the [Rando API](https://random-word-api.vercel.app/). Join the game using `!play`, even after the game has started. A moderator can also manage the game by using `!hangman skip` to skip the current player's turn, and `!hangman end` to stop the game and reveal the answer.
- `!play` - Use this command to join an active game of Hangman.
- `!rps` - Use this command to challenge lemony_friend to a game of Rock, Paper, Scissors. You can use `!rps rock` `!rps paper` `!rps scissors` to specify your move, or simply use `!rps` and a move will be chosen at random.
- `!chant` - Use this command to have lemony_friend chant it in all caps in chat..
- `!yell` - Use this command with a message to send that message across all channels where someone has chatted in the past hour.
- `!define` (or `!definition` or `!meaning`) - This command can be used followed by a word to look up its definition using an API from [API Ninjas](https://api-ninjas.com/).
- `!lemon` (or `!lemons`) - This command can be used to check how many lemons the sender (or another user) has.
- `!lemonboard` (or `!lemonrank`) - This command can be used to check who the top three users are that have the most lemons.
- `![use]lemon[append?]` - This command is a wildcard that can be used. [Use] can be any verb (or verb phrase), and [append?] could be an optional suffix, if "lemon" is meant to be a descriptor, or possibly to pluralize "lemon" to all "lemons".
- `!lemonify` - This command can be used to transform another user's message into lemons.
- `!countdown` (or `!timer`) - This command can be used to start a countdown timer, or check the remaining duration of the countdown timer already running. You can pass in a number (in seconds) to start a new countdown timer. For example, using `!countdown 300` would start a countdown timer that lasts for five minutes.
- `!insult` - Use this command to generate a random, Mad Libs-style "insult" directed at yourself or another user. You can add your own verbs, nouns, and adjectives to its word bank by using the respective commands.
- `!verbs` (or `!verb` or `!v`) - Use this command to add to the list of verbs Lemony Friend knows.
- `!nouns` (or `!noun` or `!n`) - Use this command to add to the list of nouns Lemony Friend knows.
- `!adjectives` (or `!adjective` or `!adj` or `!a`) - Use this command to add to the list of adjectives Lemony Friend knows.
- `!tempcmds` (or `!tmpcmds`) - This command lists all existing temporary commands.
- `!greet` - This command can be used to greet one or more users. Use `!greet <user>` to greet another user, `!greet <user1> <user2>...` to greet multiple users, or `!greet all` to greet all known users in the current channel who have chatted in the past hour, other than the user of the command.
- `!goodbye` (or `!bye` or `!gn` or `!goodnight`) - This command can be used to say good night to a user leaving chat.
- `!dadjoke` - This command gets a random joke from a [Dad Joke API](https://icanhazdadjoke.com/api).
- `!pokemon` - This command can be used to get useful information about a Pokémon from a [Pokémon API](https://pokeapi.co/).
- `!ability` - This command can be used to get the description of a Pokémon ability from a [Pokémon API](https://pokeapi.co/).
- `!convert` - This command can be used to convert measurements of temperature, length, weight, and volume from one unit to another. The syntax is `!convert <number> <fromUnit> <toUnit>`. Approximate values are used for imperial versus metric units, so there may be some small inconsistencies. For weight units, there is a distinction between a metric ton, US (short) ton, and UK (long) ton. For volume units, imperial cup measurements are used except when converting to metric, in which case the legal US cup is used. The US fluid ounce is also used, rather than the imperial fluid ounce measurement.

## Count 🍋️
Each channel lemony_friend is in has a generic, unnamed counter, set to zero by default. It has a wide range of use cases, depending on what you'd like to keep count of. Here is a list of commands you can use:
- `!count` - Check the counter's current value.
- `!count +` (or `!count 1`) - Increment the counter's value by 1.
- `!count -` (or `!count -1`) - Decrement the counter's value by 1.
- `!count <number>` - Increment or decrement the counter's value by some number.
- `!count set <number>` - Set the counter's value directly.
- `!count name <...>` - Set the name of the counter to something other than its generic name.
- `!count reset` to set the counter back to zero, and remove its custom name.

## List 🍋️
Each channel lemony_friend is in has a generic, unnamed list, empty by default. Items in the list are stored in a numbered order, but can also be used for unordered items as well. Here is a list of commands you can use:
- `!list` - Check the stream's list.
- `!list add <...>` - Add an item to the list.
- `!list <number>` - Recall a specific item from the list by its number.
- `!list random` - Recall an item from the list at random.
- `!list edit <number> <...>` - Update the contents of a specific number in the list.
- `!list delete <number>` - Delete a specific item from the list, shifting the items after it back by one.
- `!list swap <number1> <number2>` (or - `!list switch <number1> <number2>`) - Have two items trade positions in the list, where `<number1>` and `<number2>` are the current positions of the items to swap.
- `!list move <number1> <number2>` - Move one item into a new position in the list, where `<number1>` is its current position, and `<number2>` is the new position you'd like it to be in. All items in between those positions will shift their positions accordingly.
- `!list name <...>` - Give the list's name a descriptive title other than its generic one, or with no name to return the list's name back to its default.
- `!list clear` - Delete all the contents of the list (keeps the list's name).
- `!list reset` - Delete all the contents of the list, and clear the list's name.

## Temporary Commands 🍋️
Temporary commands are commands that can be made on the fly by anyone, which follow a simple call-and-response pattern. They are "temporary" because they aren't hard-coded into lemony_friend, and will be lost next time it's reset.
- `!tempcmd` (or `!tmpcmd`) - This command is used to create custom commands that will be active until the next time lemony_friend is rebooted. Use `!tempcmd <commandname> <response...>` to create/edit a command name and reply. You can also use `!tempcmd delete <commandname>` to delete a command, and `!tempcmd rename <oldname> <newname>` to change the name of an existing command.

### Temporary Command Variables
There are also variables you can use in commands that will be replaced with arguments:
- `{user}` is the display name of the user of the command.
- `{usernn}` is the nickname of the user of the command (falling back on display name if there's no nickname defined).
- `{touser}` is the display name of a specified user (falling back on whatever was input, if that user isn't known, or the user of the command if no input).
- `{tousernn}` is the nickname of a specified user (works like `{touser}`).
- `{viewer}` will choose a random viewer in chat (who is not an ignored bot), even if they haven't spoken yet.
- `{viewer1}` `{viewer2}` `{viewer3}` can be used to choose up to three different random viewers (who are not ignored bots).
- `{number#}` will choose a random number between 1 and `#`, where `#` is the number supplied by the user. Supplying a 0 or negative number will choose a number between that number and zero.
- `{streamer}` is the nickname of whose chatroom the command is used in.
- `{random "one" "two" "et cetera"}` can be used to provide a list (separate items with quotes) of words/phrases for lemony_friend to choose from at random.
- `{1}` through `{9}` take whatever arguments are supplied, in order, falling back on `undefined` if not used.

Example: Using `!tempcmd !diceroll {user} rolled a {number6}!` would create a command called `!diceroll` that simulates the user of the command rolling a six-sided die.

## Command Lemon Interface 🍋️
If lemony_friend is present in your Twitch channel, or you are a moderator of a channel where lemony_friend is present, you are able to use the command `cli` to adjust lemony_friend's settings and data.

### `cli channel`
Use `cli channel` or `cli c` to access settings for the current channel (if you are the channel owner or a moderator of that channel), or your own channel. The current channel has priority, so if you are a moderator of the current channel, but would like to adjust settings for your own channel, you'll have to use this command either in your own channel, or where you are not a moderator but lemony_friend is present.

- `cli channel timers <timer_name> cooldown` or `cli c t <timer_name> cd`
- `cli channel timers <timer_name> listening` or `cli c t <timer_name> l`

Use this command to adjust the cooldown and "listening" status of timers for bot commands and reply types. Having a cooldown prevents the same command from being responded to multiple times within that time period. Changing the "listening" status of a command or reply type to `false` prevents the bot from acknowledging the message. For example, if you already have a bot in your channel that handles shoutouts, and don't want lemony_friend to give them, you can use `cli channel timer !so listening false` to disable this behavior. Here is a current list of all timers that can be adjusted and/or enabled/disabled: `!so` The command for giving shoutouts, `!raid` The command for saying the raid message(s), `!count` The command for viewing/adjusting the count, `streak` Listening for message/emote streaks, `new-chatter` Greeting new chatters in a chatroom (does not include spam detection), `greet` Saying hi to one user, `mass-greet` Saying hi to multiple users, `say-goodnight` Saying bye/goodnight to a user, `say-thanks` Saying thanks to a user, `say-youre-welcome` Saying you're welcome to a user, `say-mood` Responding to "how are you" messages

- `cli channel emotes` or `cli c e` (array of strings)

Use this command to update the list of emotes lemony_friend has access to within a channel.

- `cli channel bttvEmotes` or `cli c bttv` (array of strings)

Use this command to update the list of BTTV emotes lemony_friend has access to within a channel.

- `cli channel subRaidMessage` or `cli c srm` (string)

Use this command to update lemony_friend's response to the `!raid` command. The "sub" raid message is intended for raid messages which use emotes that require a subscription to the channel.

- `cli channel noSubRaidMessage` or `cli c nsrm` (string)

Use this command to update lemony_friend's response to the `!raid` command. The "no sub" raid message is intended for raid messages which do not use emotes that require a subscription to the channel (accessible to anyone).

- `cli channel rollFunNumber` or `cli c rfn` (boolean)

By default, lemony_friend posts a random message in chat after another chatter's every Nth message. Use this command to turn on or off this behavior.

### `cli users`
Use `cli users` or `cli u` to access settings for a specific user. Using, or not using, an @ when entering the username are both acceptable. In the case of non-English display names, the username must be used, as the display name will not be recognized.

- `cli user <@?username> nickname` or `cli u <@?username> nn` (string)

Use this command to adjust the nickname of a user. This will be used by the bot when addressing the user, or use their display name as a fallback if the nickname is empty.

- `cli user <@?username> away` or `cli u <@?username> a` (boolean)

Use this command to mark a user as known by the bot to be away. The bot will welcome them back upon their first message in chat.

- `cli user <@?username> awayMessage` or `cli u <@?username> am` (string)

Use this command to update a user's away message. This is mentioned by the bot if the user marked as being away is mentioned in chat.

### `cli settings`
Use `cli settings` or `cli s` to access lemony_friend's settings. These are global (not specific to a certain channel).

- `cli settings autoBan` or `cli s ab` (array of phrases)

Use this command to change lemony_friend's list of phrases from a first-time chatter that will result in an automatic ban. Use `cli settings autoBan add <your phrase>` to add one phrase, `cli settings autoBan delete <banned phrase>` to delete one phrase, or use `cli settings autoBan clear` to empty the entire list. "Add", "delete", and "clear" can also be abbreviated to "a", "d", and "c", respectively. Phrases are implemented in a non-case-sensitive way.

- `cli settings ignoredBots` or `cli s ib` (array of strings)

Use this command to update the list of usernames lemony_friend will ignore in certain situations. These include welcoming back the user if they haven't spoken in a while, being informed a user is marked as "away" when mentioning them, and being targeted with UndertaleBot, as well as other fun number responses.

- `cli settings pokeballQuantity` or `cli s pq` (number)
Use this command to change the amount of pokeballs lemony_friend will attempt to purchase if PokemonCommunityGame says it doesn't have pokeballs (default 100). This can be used to help lemony_friend avoid a loop of continually trying and failing to use pokeballs and purchasing them when it runs out and can't afford to purchase the quantity currently set.

- `cli settings chantEmote` or `cli s ce` (string)
Use this command to change or remove the emote/emoji used to separate chants (default 👏).

- `cli settings hangmanChances` or `cli s hc` (number)
Use this command to change the starting number of chances in Hangman (default 6).


# @lemony_friend 🍋️

Lemony Friend is a Twitch chatbot built for the Lemony Fresh streamers and their community.

## Commands
- `!commands` - This command lists all the commonly-used commands lemony_friend has.
- `!so` - This command gives a shoutout to another user by looking them up using the [Twitch API](https://dev.twitch.tv/docs/api/).
- `!hangman` - This command initiates a game of Hangman. Join the game using `!play`.
- `!play` - Use this command to join an active game of Hangman.
- `!rps` - Use this command to challenge lemony_friend to a game of Rock, Paper, Scissors. You may can use `!rps rock` `!rps paper` `!rps scissors` to specify your move, or simply use `!rps` and a move will be chosen at random.
- `!mystats` - Use this command to get the JSON data of a user.
- `!subs` - This command can be used to check lemony_friend's subscription status for all channels it is in.
- `!debug` (or `!debugmode`) - This command toggles its debug mode setting. You may also use `!debug on` or `!debug off` to specify a choice.
- `!lastmsg` - This command can be used to get a user's last message in the current channel, or use `!lastmsg <channel>` to specify a Lemony Fresh channel. 
- `!msgcount` - This command can be used to get a count of all messages sent by a user across all Lemony Fresh channels.
- `!yell` - Use this command with a message to send that message across all Lemony Fresh channels.
- `!friend` (or `!friends`) - This command can be used to get a count of all users lemony_friend knows (including itself).
- `!lemonify` - This command can be used to transform another user's message into lemons.
- `!greet` - This command can be used to greet one or more users. Use `!greet <user>` to greet one user, `!greet <user1> <user2>...` to greet multiple users, or `!greet all` to greet all known users in the current channel.
- `!tempcmd` - This command is used to create custom commands that will be active until the next time lemony_friend is rebooted. Use `!tempcmd <commandname> <response...>` to create/edit a command name and reply, and `!tempcmd delete <commandname>` to delete a command.
- `!tempcmds` - This command lists all existing temporary commands.
- `!bye` (or `!gn` or `!goodnight`) - This command can be used to say good night to a user leaving chat.
- `!color` (or `!colour`) - Use his command to get a user's chat message color.
- `!dadjoke` - This command gets a random joke from a [Dad Joke API](https://icanhazdadjoke.com/api).
- `!pokemon` - This command can be used to get useful information about a Pokémon from a [Pokémon API](https://pokeapi.co/).
- `!lurk` (or `!away` or `!brb`) - This command marks the user as "away" in the current channel. Use `!lurk <message...>` to set a custom away message. Using `!lurk` (rather than `!away` or `!brb`) does not prompt a reply from lemony_friend, opting for a quieter exit. If a user is mentioned in chat by full username while they are marked as away, lemony_friend will mention that the user is away, along with an optional away message. Upon posting in chat again, lemony_friend marks the user as unaway.

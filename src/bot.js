const dotenv = require('dotenv').config({
    path: "pw.env"
});
const {
    db
} = require('./data/sqlite.config');

const colors = require('colors');
const Snoolicious = require('./lib/Snoolicious');
const {
    editWikiPage
} = require('./wiki/WikiEditor');
const snoolicious = new Snoolicious();
const USERDIR_LINK = snoolicious.wikieditor.md.link(`http://www.reddit.com/r/${process.env.MASTER_SUB}/wiki/userdirectory/`, `User Directory`);

async function handleCommand(task) {
    console.log({
        command: task.command,
        fromUser: task.item.author.name,
        time: (new Date())
    });
    const isSaved = await snoolicious.requester.getComment(task.item).saved;
    // Check if the item was saved first.
    if (!isSaved) {
        console.log("New Command recieved! Processing...".yellow);
        switch (task.command.directive) {
            case 'rate':
                let username = task.command.args[0];
                username = stripSlashesFromUsername(username);
                let stars = parseInt(task.command.args[1]);
                let interactionType = task.command.args[3];
                let notes = task.command.args.slice(4).join(' ');
                try {
                    validateUsername(username);
                    username = await validateIsActualUser(username);
                    stars = validateRating(stars);
                    interactionType = validateInteraction(interactionType);
                    validateUserNotRatingSelf(username, task.item.author.name);
                    notes = validateNotes(notes);
                } catch (err) {
                    console.log("Replying with this error message!".red);
                    console.log(err.message);

                    return snoolicious.requester.getComment(task.item.id).reply(`${err.message} Please refer to the ${USERDIR_LINK} to learn more about using this bot!`);
                }
                await db.saveReview(username[0].toUpperCase(), username, stars, interactionType, notes, task.item.permalink);
                await editWikiPage(username[0], snoolicious.requester);
                const linkreply = snoolicious.wikieditor.md.link(`http://www.reddit.com/r/${process.env.MASTER_SUB}/wiki/userdirectory/${username[0].toLowerCase()}#wiki_${username.toLowerCase()}`, `trade history`);

                console.log("replying with success message...".green)
                await snoolicious.requester.getComment(task.item.id).reply(`Go see u/${username}'s ${linkreply} in the ${USERDIR_LINK}!`);

                break;
            case 'help':
                console.log("Sending help!".green);
                await snoolicious.requester.getComment(task.item.id).reply(`See the ${USERDIR_LINK} for instructions on how to use this bot.`)
                break;
            default:
                console.log("Command was not understood! the command: ".red, task.command);
        }
        // Save the item so snoolicious won't process it again.
        console.log("saving...".green);
        await snoolicious.requester.getComment(task.item.id).save();
    } else {
        console.log("Item was already saved!".red);
    }
    console.log("Size of the queue: ", snoolicious.tasks.size());

}

/* [Snoolicious Run Cycle] */
const INTERVAL = (process.env.INTERVAL * 1000 * 60);
console.log("S - N - O - O - L - I - C - I - O - U - S".random);
async function run() {
    await snoolicious.getCommands(1);
    console.log("APP CHECKING SIZE OF TASKS QUEUE: ".america, snoolicious.tasks.size());
    await snoolicious.queryTasks(handleCommand, null);
    console.log(`Finished Quereying Tasks. Sleeping for ${INTERVAL/1000/60} minutes...`.grey);
    setTimeout(async () => {
        await run()
    }, (INTERVAL));
}

(async () => {
    await run();
})();


/* Strip Slashes from Username */
const stripSlashesFromUsername = function (username) {
    if (username.startsWith('u/')) {
        return username.replace('u/', '');
    } else if (username.startsWith('/u/')) {
        return username.replace('/u/', '');
    } else {
        return username;
    }
}

/* Validate Username */
const validateUsername = function (username) {
    const pattern = new RegExp(/[`~!@#$%^&*()+=]/);
    if (pattern.test(username)) {
        throw new Error(message = "Username cannot contain special characters!");
    }
}

/* Validate actually a user */
async function validateIsActualUser(username) {
    let user;
    try {
        user = await snoolicious.requester.getUser(username).fetch();
    } catch (err) {
        if (err) {
            throw new Error(message = "Are you sure that's a real user?");
        }
    }
    username = user.name;
    return username;
}

/* Validate Rating */
const validateRating = function (number) {
    if (number[0] == '\\' || number[0] == '-') {
        throw new Error(message = "Rating must be a number between 0 and 5.");
    }
    // const validRating = new RegExp(/[0-5]/);
    if (number) {
        if (number > 5 | number < 0) {
            throw new Error(message = "Rating must be a number between 0 and 5.");
        }

    }
    return number;
}

/* Validate Interaction Type */
const validateInteraction = function (type) {
    if (type &&
        (type.toLowerCase() != "sale" &&
            type.toLowerCase() != "giveaway" &&
            type.toLowerCase() != "trade")) {
        // If interaction type is not = to "sale/giveaway/trade", return with an error message
        interactionType = type;
        throw new Error(message = "Check your interaction type argument!");
    }
    // If command was not given with an interaction type, default it to "sale"
    if (!type) {
        type = "sale";
    } else {
        // Set to lower case before sending to the user service.
        type = type.toLowerCase();
    }
    return type;
}

/* Validate User Not Rating Self */
const validateUserNotRatingSelf = function (username, itemauthor) {
    if (username === itemauthor) {
        throw new Error(message = "Nice try, but you can't rate yourself!");
    }
}
/* Validate Notes */
const validateNotes = function (notes) {
    if (notes) {
        return notes;
    } else {
        return '*__No notes provided__*';
    }
}
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

async function handleCommand(task) {
    const id = `${task.item.parent_id}${task.item.id}${task.item.created_utc}`;
    // const isSaved = await snoolicious.requester.getComment(task.item).saved;
    const isSaved = false;
    // Check if the item was saved first.
    if (!isSaved) {
        console.log("New Command recieved: ".yellow);
        switch (task.command.directive) {
            case 'rate':

                const username = task.command.args[0];
                const stars = task.command.args[1];
                const interactionType = task.command.args[3];
                const notes = task.command.args.slice(4).toString();
                console.log({
                    username,
                    stars,
                    interactionType,
                    notes
                });

                const link = task.item.parent_id.slice(task.item.parent_id.indexOf('_') + 1);
                const permalink = `http://www.reddit.com/r/${process.env.MASTER_SUB}/wiki/userdirectory/${username[0].toUpperCase()}`

                await db.saveReview(username[0].toUpperCase(), username, stars, interactionType, notes, permalink);

                await editWikiPage(username[0], snoolicious.requester);



                break;
            default:
                console.log("Command was not understood! the command: ".red, task.command);
        }
        // Save the item so snoolicious won't process it again.
        console.log("saving");
        // await snoolicious.requester.getComment(task.item.id).save();
    } else {
        console.log("Item was already saved!".red);
    }
    console.log("Size of the queue: ", snoolicious.tasks.size());

}

/* [Snoolicious Run Cycle] */
const INTERVAL = (process.env.INTERVAL * 1000);
async function run() {
        console.log("Running Test!!!");
        await snoolicious.getCommands(1);

        console.log("APP CHECKING SIZE OF TASKS QUEUE: ".america, snoolicious.tasks.size());
        await snoolicious.queryTasks(handleCommand, null);
        console.log(`Finished Quereying Tasks. Sleeping for ${INTERVAL/1000} seconds...`.rainbow);
        setTimeout(async () => {
            await run()
        }, (INTERVAL));
    }
    (async () => {
        await run();
    })();
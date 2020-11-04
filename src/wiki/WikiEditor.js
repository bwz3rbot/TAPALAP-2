const __ = require('colors');
const {
    db
} = require('../data/sqlite.config');
const {
    WikiPages
} = require('../wiki/pages');
const pages = new WikiPages();
const pagelist = pages.list;
const Markdown = require('../util/SnooMD');
const md = new Markdown();

const STAR = `★`;
const STAR0 = `☆`;

const generateDirectory = function (page) {
    let links = new Array();
    // If page = current iteration, bold the page in link text
    for (let i = 0; i < pagelist.length; i++) {
        let text = new String(pagelist[i]);
        if (pagelist[i] === page) {
            text = md.apply(text, md.bold);
        }
        const link = md.link(`https://www.reddit.com/r/${process.env.MASTER_SUB}/wiki/${pages.category}/${pagelist[i].toLowerCase()}`, text);
        links.push(link)
    }
    let linkstring = links.join(" |\n ");
    return linkstring.concat("\n\n-----");
}

// Edit Wiki Page
async function editWikiPage(page, requester) {
    console.log("Building new Wiki Page: ".yellow, page);

    // Get the correct page and generate a directory
    let p = page.replace("userdirectory/", "");
    const dir = generateDirectory(p.toUpperCase());

    // Find the correct model for the alphabetized page
    console.log(`Getting all users with initial: "${page}"`);
    let users = await db.getAllUsersByInitial(page);
    console.log("Found these users ", users);

    console.log("Generating a table for each user...");
    // Generate tables for each user
    const AllTables = [];

    console.log('users:');
    console.log(users);

    let prev = "";
    console.log("The list before:");
    console.log(users);

    const LIMITED_USERS = [];
    users.forEach(user => {
        console.log(`checking if "${user.username} == "${prev}"`);
        if (user.username == prev) {
            console.log(`IT DOES!`);
        } else {
            LIMITED_USERS.push(user);
            console.log("It did not.");
        }
        console.log(`setting prev to = ${user.username}`)
        prev = user.username;

    });
    console.log(
        "the list of users now:", LIMITED_USERS
    )
    for (const user of LIMITED_USERS) {
        // Format Username
        const fUsername = `#${user.username}`;
        AllTables.push(fUsername);

        console.log(`EDITING THE REVIEW OF USER: ${user.username}`)
        const REVIEWS = await db.getUserReviews(user.username);

        console.log("Got ALLLL these reviews:");
        console.log(REVIEWS);

        const reviews = [];
        REVIEWS.forEach(review => {
            reviews.push({
                rating: review.rating,
                type: review.type,
                comments: review.comments,
                permalink: review.permalink
            });

        });

        console.log("These are the reviews:");
        console.log(reviews);
        console.log("calculating the score...");
        const score = calculateScore(REVIEWS);
        let stars = "";
        let c = 0;
        for (c; c < score; c++) {
            stars += STAR;
        }
        for (c; c < 5; c++) {
            stars += STAR0;
        }

        let fullMessage = stars.concat(`(average score:${score}, total reviews:${REVIEWS.length})`);
        AllTables.push(fullMessage);

        // Push user Table Data

        const t = md.table(["Rating", "Type", "Comments", "Permalink"], reviews);
        AllTables.push(t);



    }





    // Format the data into strings
    let AllTablesString = AllTables.join("\n\n");
    const fullMessage = dir + "\n\n" + AllTablesString;

    // Update the wiki page
    console.log("Committing changes...".magenta);
    let res;
    try {
        console.log(`CREATING PAGE userdirectory/${page}`);
        console.log("saving this data:");
        console.log(fullMessage);
        res = await requester.getSubreddit(process.env.MASTER_SUB).getWikiPage('userdirectory/' + page).edit({
            reason: `New user data added.`,
            text: fullMessage
        });
    } catch (err) {
        if (err) console.log(err)
        else {
            console.log(res);

        }
    }

}

// Calculate Number of stars.
// Takes in a user and gets the average score
// Returns how many 
const calculateScore = function (reviews) {
    console.log("checking the length of reviews:");

    const count = reviews.length;
    console.log(count);
    let total = 0;
    console.log("Iterating over the reviews...");
    reviews.forEach(review => {
        total += parseInt(review.rating);
    })
    return Math.floor(total / count);
}


module.exports = {
    editWikiPage
}
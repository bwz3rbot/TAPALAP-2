/*
better-sqlite3 docs
https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md
*/
const Database = require('better-sqlite3');

function newDatabase(name) {
    return new Database(`${__dirname}/${name}.db`, {
        fileMustExist: false,
        timeout: 7000,
        verbose: console.log
    });
}

class DB {
    constructor() {

        /* REVIEWS DB */
        this.DB = newDatabase('USER_REVIEWS_DIRECTORY');
        this.initReviewsTable();



        /* Check User Exists In Directory */
        this.checkUserExists = async function (username) {
            return this.DB.prepare(`SELECT username FROM directory WHERE username = ?`).get(username);
        }

        /* Add User To Directory */

        /* Get All Users In Directory By Initial */
        this.getAllUsersByInitial = async function (initial) {
            console.log("Running query on initial: ", initial);
            return this.DB.prepare(`SELECT * FROM directory WHERE initial = ?`).all(initial.toUpperCase());
        }

        this.saveReviewSTMT =
            this.DB.prepare(
                `INSERT INTO directory (initial, username, rating, type, comments, permalink, ID) VALUES (@initial, @username, @rating, @type, @comments, @permalink, @ID)`);

        /* Add Review To Reviews DB */
        this.saveReview = async function (initial, username, rating, type, comments, permalink) {
            const ID = new Date().getTime();
            return this.saveReviewSTMT.run({
                initial,
                username,
                rating,
                type,
                comments,
                permalink,
                ID
            });
        }
        /* Get User's Reviews By Username */
        this.getUserReviews = async function (username) {
            return this.DB.prepare(`SELECT * FROM directory WHERE username = ?`).all(username);
        }

    }

    /* Initializers */

    /* Reviews Table */
    initReviewsTable() {
        const table = this.DB.prepare(
            `SELECT count(*) FROM sqlite_master WHERE type='table' AND name='directory';`
        ).get();
        if (!table['count(*)']) {
            this.DB.prepare(
                `CREATE TABLE directory (initial TEXT, username TEXT, rating NUMBER, type TEXT, comments TEXT, permalink TEXT, ID NUMBER PRIMARY KEY);`
            ).run();
            this.DB.prepare(
                `CREATE UNIQUE INDEX idx_ID_id ON directory (ID);`
            ).run();
        }
        this.DB.pragma("synchronous = 1");
        this.DB.pragma("journal_mode = wal");

    }

}

const db = new DB();

module.exports = {
    db
}
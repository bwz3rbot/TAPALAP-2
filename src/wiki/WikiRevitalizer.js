const dotenv = require('dotenv').config({
    path: "pw.env"
});

const WikiInitializer = require('./WikiInitializer');
const fullRefreshFlag = JSON.parse(process.argv[2] || false);
console.log("successfully connected to mongodb".green);
console.log("Running the Wiki Pages Revitalizer... flag set to: ", fullRefreshFlag);

(async () => {
await WikiInitializer.runRevitalizer(fullRefreshFlag);
console.log("All done!");
process.exit();
})();

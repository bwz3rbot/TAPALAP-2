const dotenv = require('dotenv').config({
    path: "pw.env"
});
const WikiInitializer = require('./WikiInitializer');

console.log("SUB", process.env.MASTER_SUB);
(async () => {
    await WikiInitializer.runInstaller();
})();

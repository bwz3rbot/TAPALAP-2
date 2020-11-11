const dotenv = require('dotenv').config({
    path: "pw.env"
});
const WikiInitializer = require('./WikiInitializer');

console.log("SUB", process.env.MASTER_SUB);
(async () => {
    try{
    await WikiInitializer.runInstaller();
    } catch(err){
        if(err){
            console.log(err);
            process.exit();
        }
    }
})();

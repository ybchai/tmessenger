const runMigration = require("./database/migrate.js");

runMigration()
    .then(()=>{
        console.log("Migration completed");
        process.exit(0);
    })
    .catch(error=>{
        console.error(error);
        process.exit(1);
    });
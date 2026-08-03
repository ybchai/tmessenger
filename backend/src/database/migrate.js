require("dotenv").config(); // load environment variables

const { Client } = require("pg"); // import Postgres client from pg library
const fs = require("fs"); // import file system module (used to read migration files)
const path = require("path"); // import path module (used to build safe file paths across OS)

// Runs all pennding SQL migration files in the migrations directory
// Ensures each migration runs only once by tracking htem in a database table
async function runMigration() {
  // create new Postgres client with connection details from environment variables
  const client = new Client({
    connectionString: process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // connect to the database
    await client.connect();
    console.log("Database connected successfully");

    // create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // get list of executed migrations from the database
    const result = await client.query("SELECT filename FROM migrations");

    // convert the result to an array of filenames
    const executedMigrations = result.rows.map((row) => row.filename);

    // Build full path to the migrations folder
    const migrationDir = path.join(__dirname, "migrations");

    // Read all SQL files from the migrations directory
    // Filter only .sql files and sort them
    const files = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // loop through each migration files
    for (const file of files) {
      // skip this migration if it has already been executed
      if (executedMigrations.includes(file)) {
        console.log(`Migration ${file} already executed, skipping...`);
        continue;
      }
      // build the full path to the migration file
      const filePath = path.join(migrationDir, file);
      // read the migration file content
      const migration = fs.readFileSync(filePath, "utf8");
      // Execute the migration SQL
      await client.query("BEGIN");
      await client.query(migration);
      // Record the migration as executed in the migrations table
      await client.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT")
      console.log(`Migration ${file} executed successfully`);
    }
  } catch (error) {
    // catch and log any errors during migration or connection
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // always close the database connection (success or failure)
    await client.end();
  }
}

// run the migration
module.exports = runMigration;

import knex from "knex";
import configSqlite3 from "../db/sqlite";

const database = knex(configSqlite3);

const createMessageTable = async () => {
  try {
    await database.schema.dropTableIfExists("message");
    await database.schema.createTable("message", (messageTable) => {
      messageTable.increments("id").primary();
      messageTable.string("username", 100).notNullable();
      messageTable.string("message", 500).notNullable();
      messageTable.string("time", 250).notNullable();
    });

    console.log("Message table created");
    database.destroy();
  } catch (err) {
    console.log(err);
    database.destroy();
  }
};

createMessageTable();

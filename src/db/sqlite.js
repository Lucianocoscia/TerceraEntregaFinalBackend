import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

//conexion con sqlite3
const configSqlite3 = {
  client: "sqlite3",
  connection: {
    filename: path.resolve(__dirname, "../database/ecommerce.sqlite"),
  },
  useNullAsDefault: true,
};

export default configSqlite3;

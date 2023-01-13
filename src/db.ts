import { Sequelize } from "sequelize";
import config from "../config";

const dbOptions = config.db;
const DB_PATH = dbOptions.path;

const sequelize = new Sequelize(DB_PATH, {
  logging: false,
});

sequelize.sync();

export default sequelize;

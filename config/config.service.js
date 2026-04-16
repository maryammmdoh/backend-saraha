import path from "path";
import dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV;
const envpath = {
    dev: path.resolve("./config/.env.dev"),
    prod: path.resolve("./config/.env.prod"),
}
dotenv.config({ path: envpath[NODE_ENV] });

// console.log(`Running in ${NODE_ENV} mode`);

export const SERVER_PORT = process.env.PORT;
export const DB_URL = process.env.DB_URL;
export const DB_ATLAS_URL = process.env.DB_ATLAS_URL;
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const SIGNATURE_KEY_USER = process.env.SIGNATURE_KEY_USER;
export const SIGNATURE_KEY_ADMIN = process.env.SIGNATURE_KEY_ADMIN;
export const SIGNATURE_KEY_USER_REFRESH = process.env.SIGNATURE_KEY_USER_REFRESH;
export const SIGNATURE_KEY_ADMIN_REFRESH = process.env.SIGNATURE_KEY_ADMIN_REFRESH;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const REDIS_URL = process.env.REDIS_URL;
export const Mail_USER = process.env.Mail_USER;
export const Mail_PASS = process.env.Mail_PASS;
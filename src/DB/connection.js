import {connect} from "mongoose";
import { DB_ATLAS_URL, DB_URL, NODE_ENV } from '../../config/config.service.js';

async function connectDB() {
    try {
        // In local/dev we should connect using DB_URL (localhost).
        // In prod we should connect using the Atlas URL.
        const uri = NODE_ENV === "prod" ? DB_ATLAS_URL : DB_URL;
        await connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

export default connectDB;
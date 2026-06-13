import { createClient } from "redis"
import { REDIS_URL } from "../../config/config.service.js";

export const client = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      return Math.min(retries * 200, 3000);
    },
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});

client.on("connect", () => {
  console.log("Redis socket connected");
});

client.on("ready", () => {
  console.log("Connected to Redis");
});

client.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

async function redisConnection() {
    try {
        await client.connect();
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

export default redisConnection;
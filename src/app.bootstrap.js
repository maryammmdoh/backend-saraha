import express from "express";

import authRouter from "./Modules/Auth/auth.controller.js";
import { NODE_ENV, SERVER_PORT } from "../config/config.service.js";
import connectDB from "./DB/connection.js";
import { globalErrHandling } from "./Common/Response/response.js";
import userRouter from "./Modules/User/user.controller.js";
import cors from "cors";
import path from "path";
import redisConnection from "./DB/redis.connection.js";
import messageRouter from "./Modules/Message/message.controller.js";

import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import geoip from "geoip-lite";
// import  * as rediesMethods  from "./DB/redis.service.js";

async function bootstrap() {
  const app = express();
  const PORT = SERVER_PORT;

  await connectDB();
  await redisConnection();
  app.set("trust proxy", true); // Enable trust proxy if your app is behind a reverse proxy (e.g., Heroku, Nginx) to ensure that the client's IP address is correctly identified for rate limiting and other middleware that relies on the client's IP address.
  // Adjust this setting based on your deployment environment and proxy configuration.
  // await sendEmail({
  //     to: "949a6263ed@emailax.pro",
  //     subject: "Test Email from Saraha App",
  //     text: "This is a test email sent from the Saraha application to verify that the email configuration is working correctly.",
  //     html: "<p>This is a test email sent from the <strong>Saraha</strong> application to verify that the email configuration is working correctly.</p>",
  // });

  //whitelist of allowed origins for cores, you can adjust this list as needed for your deployment environment (e.g., production domain)
  const coresOptions = {
    origin: "*",
  };

  app.use(cors(coresOptions)); // Use CORS middleware with the defined options to enable Cross-Origin Resource Sharing for the specified origins, allowing the frontend application to make requests to this backend API without being blocked by the browser's same-origin policy. Adjust the 'origin' option as needed for your deployment environment (e.g., production domain).
  app.use(express.json()); // to parse JSON request bodies
  app.use(helmet()); // Use Helmet to set secure HTTP headers
  app.use(
    rateLimit({
    //   windowMs: 5 * 60 * 1000, // 5 minutes , this is the time frame for which requests are checked/remembered by the rate limiter
        windowMs: 30 * 1000, // 30 seconds , this is the time frame for which requests are checked/remembered by the rate limiter
    // limit: 3, // limit each IP to 3 requests per windowMs , you can adjust this number based on your needs and expected traffic
      limit: (req, res) => {
        // Custom function to determine the rate limit based on the client's IP address and geolocation information, this allows you to apply different rate limits for different clients based on their location (e.g., stricter limits for certain countries or regions) and also it makes both ipv4 and ipv6 work by normalizing the IP address format using the ipKeyGenerator function provided by express-rate-limit, this ensures that both IPv4 and IPv6 addresses are treated consistently for rate limiting purposes, preventing issues where the same client might be identified differently based on the IP version they are using
        const geoInfo = geoip.lookup(req.ip) || {}; // Get geolocation information for the client's IP address using the geoip-lite library, this can be used to apply different rate limits based on the client's location (e.g., stricter limits for certain countries or regions)
        return geoInfo.country === "EG" ? 3 : 1; // Apply a stricter rate limit (e.g., 3 requests per window) for clients from Egypt (country code "EG") and a more lenient rate limit (e.g., 1 requests per window) for clients from other countries, you can adjust the country code and rate limits as needed for your deployment environment and expected traffic patterns
      },
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers in the response, as they are not needed when using the `standardHeaders` option
      // message: "Too many requests from this IP, please try again after 5 minutes", // Custom message to send when the rate limit is exceeded
      // statusCode: 429, // HTTP status code to send when the rate limit is exceeded
      handler: (req, res) => {
        // return res.status(429).json({
        //     status: "fail",
        //     message: "Too many requests from this IP, please try again after 5 minutes",
        // }); // Custom handler function to send a JSON response when the rate limit is exceeded, you can customize the response format and content as needed also it overrides the default message and status code defined above, so you can choose to use either the default options or the custom handler based on your requirements
        const resetTime = req.rateLimitInfo?.resetTime;

        const retryAfterSeconds = resetTime
          ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
          : 5 * 60;

        const minutes = Math.floor(retryAfterSeconds / 60);
        const seconds = retryAfterSeconds % 60;

        return res.status(429).json({
          status: "fail",
          message: `Too many requests. Try again after ${minutes}m ${seconds}s`,
          retryAfterSeconds,
          countdown: `${minutes}m ${seconds}s`,
        });
      },
      requestPropertyName: "rateLimitInfo", // Custom property name to store rate limit information in the request object, you can access this information in your route handlers if needed (e.g., req.rateLimitInfo)
      keyGenerator: (req) => {
        const ip = ipKeyGenerator(req.ip); // Use the default IP key generator to get the client's IP address, this is important for applying rate limits on a per-IP basis, you can customize this function to include other factors if needed (e.g., user ID, HTTP method) to create more granular rate limits , make both ipv4 and ipv6 work by normalizing the IP address format using the ipKeyGenerator function provided by express-rate-limit, this ensures that both IPv4 and IPv6 addresses are treated consistently for rate limiting purposes, preventing issues where the same client might be identified differently based on the IP version they are using
        return `${ip}-${req.path}`; // Custom function to generate a unique key for each request based on the client's IP address and the requested path, this allows you to apply rate limiting on a per-endpoint basis rather than globally for all requests from the same IP address, you can customize this function to include other factors if needed (e.g., user ID, HTTP method) to create more granular rate limits
      },
      // store:{
      //     incr: async (key, callback) => {
      //         const hits = await rediesMethods.incr(key); // Increment the count of requests for the given key in Redis, this is used to track the number of requests made by each client and determine when they have exceeded the rate limit
      //         if (hits === 1) {
      //             await rediesMethods.setExpire(key, 60); // Set an expiration time for the key in Redis to automatically reset the count after the defined window (e.g., 1 minute)
      //         }
      //         callback(null, hits); // Function to increment the count of requests for a given key in the rate limiter's store (e.g., Redis), this is used to track the number of requests made by each client and determine when they have exceeded the rate limit
      //     }, // Function to increment the count of requests for a given key in the rate limiter's store (e.g., Redis), this is used to track the number of requests made by each client and determine when they have exceeded the rate limit
      //     decrement: async (key) => {
      //         const isKeyExist = await rediesMethods.exists(key);
      //         if (isKeyExist) {
      //             await rediesMethods.decr(key);
      //         }
      //     }, // Function to decrement the count of requests for a given key in the rate limiter's store (e.g., Redis), this is used to track the number of requests made by each client and determine when they have exceeded the rate limit
      // },
      // skipFailedRequests: true, // Option to skip counting failed requests (e.g., those that result in an error response) towards the rate limit, this can be useful to prevent penalizing clients for legitimate errors while still enforcing rate limits on successful requests (not recommended)
      // skipSuccessfulRequests: false, // Option to skip counting successful requests towards the rate limit, this can be useful to allow unlimited successful requests while still enforcing rate limits on failed requests (e.g., to prevent brute-force attacks while allowing legitimate traffic) (not recommended)
    }),
  ); // Use express-rate-limit middleware to limit repeated requests to public APIs and/or endpoints such as password reset

  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  app.use((error, req, res, next) => {
    globalErrHandling(error, req, res, next);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default bootstrap;

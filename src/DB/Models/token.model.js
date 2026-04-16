import mongoose, { Types } from "mongoose";

const tokenSchema = new mongoose.Schema({
    jti: {
        type: String,
        required: true,},
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true, },
    expiresAt: {
        type: Date,
        required: true, },
});
//ttl => time to live, the document will be automatically removed after the specified time has passed since the value of the expiresAt field.
// tokenSchema.index("expiresAt", { expireAfterSeconds: 0 });


export const TokenModel = mongoose.model("Token", tokenSchema);
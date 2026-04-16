import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content:
        {
            type: String,
            required: function() {
                return !this.attachment.length; // content is required if there are no attachments
            }
        },
        attachment:{
            type: [String]
        },
        senderId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receiverId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const MessageModel = mongoose.model("Message", messageSchema);
export default MessageModel;

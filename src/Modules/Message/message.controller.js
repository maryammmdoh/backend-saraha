import express from "express";
import {
  localUpload,
  allowedFileFormats,
} from "../../Common/Multer/multer.config.js";
import { sendMessage, getMessageById, getAllMsgs, deleteMessage } from "./message.service.js";
import {
  badRequestException,
  successResponse,
} from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { deleteMessageSchema, getMessageByIdSchema, sendMessageSchema } from "./message.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";
const messageRouter = express.Router({caseSensitive: true , strict: true});

//Send a message
messageRouter.post(
  "/:receiverId",
  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
      const authMiddleware = authentication();
      return authMiddleware(req, res, next);
      //return authentication()(req, res, next); // the same as above but without storing the middleware in a variable, but this way is less readable and harder to debug if there is an issue with the authentication middleware
    }
    next();
  },
  localUpload({
    foldername: "messages",
    allowedFileFormats: [
      ...allowedFileFormats.img,
      ...allowedFileFormats.video,
    ],
    fileSize: 50,
  }).array("msgAttachments", 5),

  validation(sendMessageSchema),

  async (req, res) => {
    if (!req.body && !req.files) {
      return badRequestException("No content or attachments provided");
    }

    const { content } = req.body;
    const { receiverId } = req.params;
    const filesData = req.files;
    const senderId = req.userId?._id;

    const result = await sendMessage(receiverId, content, filesData, senderId);
    return successResponse(res, result.message, result.data);
  },
);

//get msg by id

messageRouter.get(
  "/get-Msg-By-Id/:messageId",
  authentication(),
  validation(getMessageByIdSchema),
  async (req, res) => {
    const { messageId } = req.params;
    const userId = req.userId._id;
    const result = await getMessageById(messageId, userId);
    return successResponse(res, { data: result });
  },
);

//get all msgs for a user
messageRouter.get("/get-All-Msgs", authentication(), async (req, res) => {
  const userId = req.userId._id;
  const result = await getAllMsgs(userId);
  return successResponse(res, { data: result });
});

//delete a message
messageRouter.delete(
  "/delete-Msg/:messageId",
  authentication(),
    validation(deleteMessageSchema),
    async (req, res) => {
    const { messageId } = req.params;
    const userId = req.userId._id;
    const result = await deleteMessage(messageId, userId);
    return successResponse(res, { data: result });
  },
);

export default messageRouter;

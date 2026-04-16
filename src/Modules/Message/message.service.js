import * as DBRepo from "../../DB/db.repository.js";
import UserModel from "./../../DB/Models/User.model.js";
import {
  badRequestException,
  notFoundException,
  successResponse,
} from "../../Common/Response/response.js";

export async function sendMessage(receiverId, content, filesData, senderId) {
  try {
    const receiver = await DBRepo.findByid({
      model: UserModel,
      id: receiverId,
    });
    if (!receiver) {
      return badRequestException("Receiver not found");
    }

    console.log({ filesData });

    await DBRepo.create({
      model: MessageModel,
      inserteddata: {
        content,
        attachment: filesData ? filesData.map((file) => file.path) : [],
        senderId,
        receiverId,
      },
    });
  } catch (error) {}
}

export async function getMessageById(messageId, userId) {
  try {
    const message = await DBRepo.findOne({
      model: MessageModel,
      filters: { _id: messageId, receiverId: userId._id },
      select: "-senderId",
    });
    if (!message) {
      return notFoundException("Message not found");
    }
    return successResponse(null, "Message retrieved successfully", message);
  } catch (error) {
    return badRequestException(error.message);
  }
}

export async function getAllMsgs(userId) {
  try {
    const messages = await DBRepo.find({
      model: MessageModel,
      filters: {
        $or: [{ receiverId: userId._id }, { senderId: userId._id }],
       },
      select: "-senderId",
    });
    if (!messages || messages.length === 0) {
      return notFoundException("No messages found");
    }
    return successResponse(null, "Messages retrieved successfully", messages);
  } catch (error) {
    return badRequestException(error.message);
  }
}

export async function deleteMessage(messageId, userId) {
  try {
    const message = await DBRepo.deleteOne({
      model: MessageModel,
      filters: { _id: messageId, receiverId: userId._id },
    });
    if (!message.deletedCount) {
      return notFoundException("Message not found or you are not the receiver");
    }
    return successResponse(null, "Message deleted successfully");
  } catch (error) {
    return badRequestException(error.message);
  }
}

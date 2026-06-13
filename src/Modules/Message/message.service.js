import * as DBRepo from "../../DB/db.repository.js";
import UserModel from "./../../DB/Models/User.model.js";
import MessageModel from "./../../DB/Models/Message.model.js";
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
      // return badRequestException("Receiver not found");
      throw new Error("Receiver not found");
    }

    // console.log({ filesData });

     const message = await DBRepo.create({
      model: MessageModel,
      inserteddata: {
        content,
        attachment: filesData ? filesData.map((file) => file.path) : [],
        senderId,
        receiverId,
      },
    });
    // return successResponse({ res, statusCode: 200, data: result });
    return {message: "Message sent successfully",data: message};
  } catch (error) {
    return badRequestException(error.message);
  }
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
    return {message: "Message retrieved successfully", data: message};
  } catch (error) {
    throw new Error("Message not found");
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
    return {message: "Messages retrieved successfully", data: messages};
  } catch (error) {
    throw new Error("No messages found");
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
    return {message: "Message deleted successfully", data: null};
  } catch (error) {
    return badRequestException(error.message);
  }
}

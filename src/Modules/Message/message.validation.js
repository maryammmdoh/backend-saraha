import joi from "joi";
import { commonValidation } from "../../Middleware/validation.middleware.js";

export const sendMessageSchema = {
    body: joi.object({}).keys({
        content: joi.string().min(3).max(1000).messages({
            "string.base": "Content must be a string",
            "string.empty": "Content cannot be empty",
            "string.min": "Content must be at least 3 characters",
            "string.max": "Content cannot exceed 1000 characters",
        }),
    }),
    params: joi.object({}).keys({
        receiverId: commonValidation.id.required().messages({
            "string.base": "Receiver ID must be a string",
            "string.empty": "Receiver ID cannot be empty",
            "string.hex": "Receiver ID must be a valid hexadecimal string",
            "string.length": "Receiver ID must be exactly 24 characters",   
            "any.required": "Receiver ID is required",
        }),
    }),
}

export const getMessageByIdSchema = {
    params: joi.object({}).keys({
        messageId: commonValidation.id.required().messages({
            "string.base": "Message ID must be a string",
            "string.empty": "Message ID cannot be empty",
            "string.hex": "Message ID must be a valid hexadecimal string",
            "string.length": "Message ID must be exactly 24 characters",
            "any.required": "Message ID is required",
        }).required(),
    }),
}

export const deleteMessageSchema = {
    params: joi.object({}).keys({
        messageId: commonValidation.id.required().messages({
            "string.base": "Message ID must be a string",
            "string.empty": "Message ID cannot be empty",
            "string.hex": "Message ID must be a valid hexadecimal string",
            "string.length": "Message ID must be exactly 24 characters",
            "any.required": "Message ID is required",
        }).required(),
    }),
}
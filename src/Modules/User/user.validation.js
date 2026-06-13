import joi from "joi";
import { commonValidation, idValidation } from "../../Middleware/validation.middleware.js";

export const ProfilePictureUploadValidation = {
    file: joi.object({}).keys({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().valid("image/png", "image/jpg", "image/jpeg").required(),
        size: joi.number().required(),
        finalPath: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required()
    }).required()
}

export const CoverPictureUploadValidation = {
    files: joi.array().items(
        joi.object({}).keys({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi.string().valid("image/png", "image/jpg", "image/jpeg").required(),
            size: joi.number().required(),
            finalPath: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required()
        })
    ).required()
}

export const GetAnotherUserProfileSchema = {
    params: joi.object().keys({
        profileId: joi.string().custom(idValidation)
        })
.required(),
};

export const UpdatePasswordSchema = {
    body: joi.object().keys({
        oldPassword: commonValidation.password.required(),
        newPassword: commonValidation.password.required(),
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).required(),
    }).required()
}
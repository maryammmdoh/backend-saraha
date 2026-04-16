import joi from 'joi';
import { commonValidation } from '../../Middleware/validation.middleware.js';

export const loginSchema = {
    body : joi.object({}).keys({
        email: commonValidation.email.required(),
        password: commonValidation.password.required(),
    })
    .required()
};

export const signupSchema = {
    query: joi.object({}).keys({
        ln: joi.string().valid("en", "ar").default("en").required(),
    }),
    body: joi.object({}).keys({
        userName: commonValidation.userName.required(),
        email: commonValidation.email.required(),
        password: commonValidation.password.required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        phone: commonValidation.phone,
        DOB: commonValidation.DOB,
        gender: commonValidation.gender,
    }).required()
};

export const confirmEmailSchema = {
    body: joi.object({}).keys({
        email: commonValidation.email.required(),
        otp: commonValidation.OTP.required(),
    }).required()
}

export const resendotpConfirmationEmailSchema = {
    body: joi.object({}).keys({
        email: commonValidation.email.required(),
    }).required()
}

export const sendOTPForgetPasswordSchema = {
    body: joi.object({}).keys({
        email: commonValidation.email.required(),
    }).required()
}

export const verifyOTPForgotPasswordSchema = {
    body: joi.object({}).keys({
        email: commonValidation.email.required(),
        otp: commonValidation.OTP.required(),
    }).required()
}

export const resetPasswordSchema = {
    body: joi.object({}).keys({
        email: commonValidation.email.required(),
        otp: commonValidation.OTP.required(),
        newPassword: commonValidation.password.required(),
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).required(),
    }).required()
}




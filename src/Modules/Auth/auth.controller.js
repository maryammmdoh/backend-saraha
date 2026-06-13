import express from "express";
import * as authservice from "./auth.service.js";
import { badRequestException, notFoundException, successResponse } from "../../Common/Response/response.js";
import joi from "joi";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  confirmEmailSchema,
  loginSchema,
  resendotpConfirmationEmailSchema,
  signupSchema,
  sendOTPForgetPasswordSchema,
  resetPasswordSchema,
  verifyOTPForgotPasswordSchema,
  signupWithGmailSchema,
} from "./auth.validation.js";
import { auth } from "google-auth-library";

const authRouter = express.Router();

authRouter.post("/", (req, res) => {
    res.send("auth route");
});

//done
authRouter.post("/signup", 
    validation(signupSchema), async (req, res) => {
    // validation must be added after the multer middleware to validate the request body after the file is uploaded and the request body is parsed by multer and assigned to req.body and the file is assigned to req.file and if we add the validation middleware before the multer middleware it will not work because the request body will not be parsed and assigned to req.body and the file will not be assigned to req.file and the validation middleware will not be able to validate the request body and it will throw an error because it will try to access properties of undefined (req.body) in the validation process
    // also in postman we can send the request body as form-data and add a key with the name of the field that we want to validate (e.g., userName, email, password, etc.) and add the value of that key as the value of the field in the form-data and also we can add a key with the name of the file field (e.g., profilePicture) and add the file as the value of that key in the form-data and this way we can send both the request body and the file in the same request and it will be parsed by multer and assigned to req.body and req.file respectively and then we can validate the request body using the validation middleware after multer middleware
    try {
        // console.log(req.file);
        
        const user = await authservice.signup(req.vbody); // vbody is the validated and sanitized value of req.body that is assigned in the validation middleware after validating it against the defined Joi schema for the body key in the signupSchema object and it can be used in the controller with the correct types and formats instead of using req.body which may contain invalid data that can cause errors in the controller or in the service layer when trying to use it without validating it first
        successResponse({ res, statusCode: 201, data: user });

    } catch (error) {
        // notFoundException(error.message || "Something went wrong");
        notFoundException("Something went wrong", { error: error.message });
    }
});
//done
authRouter.post("/confirm-email", 
    validation(confirmEmailSchema),
    async (req, res) => {
        try {
            const result = await authservice.confirmEmail(req.vbody);
            successResponse({ res, statusCode: 200, data: result });
        } catch (error) {
            notFoundException(error.message || "Something went wrong");
        }
});
//  done
authRouter.post("/send-otp-forget-password", 
    validation(sendOTPForgetPasswordSchema), async (req, res) => {
    try {        
        await authservice.sendOTPForgetPassword(req.vbody.email);
        successResponse({ res, statusCode: 200, data: { message: "OTP sent successfully, please check your email" } });
    }   catch (error) {
        notFoundException(error.message || "Something went wrong");
    }
});
//done
authRouter.post("/resend-otp-confirm-email",
    validation(resendotpConfirmationEmailSchema),
    async (req, res) => {
        try {
            await authservice.resendConfirmationEmailOTP(req.vbody.email);
            successResponse({ res, statusCode: 200, data: { message: "OTP resent successfully, please check your email" } });
        }
            catch (error) {     
            notFoundException(error.message || "Something went wrong");
        }
});
//done
authRouter.post("/resend-otp-reset-password",
    validation(resendotpConfirmationEmailSchema),
    async (req, res) => {
        try {
            await authservice.resendForgetPasswordOTP(req.vbody.email);
            successResponse({ res, statusCode: 200, data: { message: "OTP resent successfully, please check your email" } });
        }
            catch (error) {     
            notFoundException(error.message || "Something went wrong");
        }
});
//done
authRouter.post("/reset-password", 
    validation(resetPasswordSchema), async (req, res) => {
    try {
        await authservice.resetPassword(req.vbody);
        successResponse({ res, statusCode: 200, data: { message: "Password reset successfully" } });
    } catch (error) {
        notFoundException(error.message || "Something went wrong");
    }
});
//done
authRouter.post("/verify-otp-forget-password", 
    validation(verifyOTPForgotPasswordSchema), async (req, res) => {
    try {
        await authservice.verifyOTPForgetPassword(req.vbody);   
        successResponse({ res, statusCode: 200, data: { message: "OTP verified successfully" } });
    } catch (error) {   
            notFoundException(error.message || "Something went wrong");
    }
});

authRouter.post("/signup/gmail", validation(signupWithGmailSchema), async (req, res) => {
    try {
        const { status, result } = await authservice.signupWithGmail(req.vbody.idToken);
        successResponse({ res, statusCode: status, data: result });
    } catch (error) {
        notFoundException(error.message || "Something went wrong");
    }
});
//done
authRouter.post("/login", validation(loginSchema), async (req, res) => {
    try {
        const user = await authservice.login(req.vbody);
        successResponse({ res, statusCode: 200, data: user });
    } catch (error) {
        notFoundException(error.message || "Something went wrong");
    }
});

export default authRouter;
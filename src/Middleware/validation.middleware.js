import { badRequestException } from "../Common/Response/response.js";
import { GenderEnum } from './../Common/Enums/user.enums.js';
import joi  from 'joi';
import  mongoose from 'mongoose';
import {Types} from 'mongoose';

export function validation(schema) {
  return (req, res, next) => {
    const validateErrors = [];
    for (const schemakey of Object.keys(schema)) {
      // Loop through each key in the schema object (e.g., body, query, params) and validate the corresponding part of the request (e.g., req.body, req.query, req.params) against the defined Joi schema for that key
      // Abort early is set to false to return all the errors in the validation process instead of returning the first error only , this is useful for the client to know all the errors in the request body and fix them all at once instead of fixing one error and sending the request again to find out that there is another error in the request body
      const validateResult = schema[schemakey].validate(req[schemakey], {
        abortEarly: false,
      });
      req["v" + schemakey] = validateResult.value; // assign the validated and sanitized value back to the request object (e.g., req.body, req.query, req.params) so that it can be used in the controller with the correct types and formats

      if (validateResult.error?.details.length > 0) {
        validateErrors.push(validateResult.error);
      }
    }

    if (validateErrors.length > 0) {
      throw badRequestException("Validation error", validateErrors);
    }

    next();
  };
};

export const commonValidation = {
  userName: joi.string().pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)).messages({
    "string.pattern.base": "userName must each name starting with an uppercase letter followed by lowercase letters and a space in between, only two names are allowed ",
    "string.empty": "userName cannot be empty",
    "any.required": "userName is required"
  }),
  // email: joi.string().pattern(new RegExp(/^\w{3,25}@(gmail|yahoo|hotmail|icloud)\.(com|net|org){1,4}$/)).trim().messages({
  //   "string.pattern.base": "email must be a valid email address it accept only characters and digits and only _ from special characters before @ also with a domain of gmail, yahoo, hotmail, or icloud and a TLD of com, net, or org",
  //   "string.empty": "email cannot be empty",
  //   "any.required": "email is required"
  // }),
  email: joi.string(),
  password: joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,16}$/)).messages({
    "string.pattern.base": "password must be 8-16 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character",
    "string.empty": "password cannot be empty",
    "any.required": "password is required"
  }),
  phone: joi.string().pattern(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)).messages({
    "string.pattern.base": "phone must be a valid Egyptian mobile number starting with +201, 00201, or 01 followed by 0, 1, 2, or 5 and then 8 digits",
    "string.empty": "phone cannot be empty",
    "any.required": "phone is required"
  }),
  DOB: joi.date().messages({
    "date.base": "DOB must be a valid date",
    "any.required": "DOB is required"
  }),
  gender: joi.string().valid(...Object.values(GenderEnum)).insensitive().messages({
    "any.only": "gender must be one of the following values: " + Object.values(GenderEnum).join(", "),
    "string.empty": "gender cannot be empty",
    "any.required": "gender is required"
  }),
  OTP: joi.string().pattern(new RegExp(/^\d{6}$/)).messages({
    "string.pattern.base": "OTP must be a 6-digit number",
    "string.empty": "OTP cannot be empty",
    "any.required": "OTP is required"
  }),
  id: joi.string().custom(idValidation).messages({
    "string.base": "ID must be a string",
    "string.empty": "ID cannot be empty",
    "any.required": "ID is required"
  }),
};

export function idValidation(value, helpers) {
  if(!mongoose.Types.ObjectId.isValid(value)){
    return helpers.message("Invalid ID format");
  }
  return value;
}
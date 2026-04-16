// To Get a consistent response format across the application, we can create a Response function that encapsulates the structure of our API responses. This class can include properties like status, message, and data, and can be used to standardize the way we send responses from our controllers.


import { NODE_ENV } from "../../../Config/config.service.js";

export function successResponse({res, statusCode = 200, data}) {
    return res.status(statusCode).json({ msg: "success", data });
}

export const globalErrHandling = (error, req, res, next) => {
    return NODE_ENV == "dev"
        ? res
        .status(error.cause?.statusCode ?? 500)
        .json({ errMsg: error.message, error, stack: error.stack, extra: error.cause?.extra })
        : 
        res
        .status(error.cause?.statusCode ?? 500)
        .json({ errMsg: error.message || "Something went wrong", error, stack: error.stack, extra: error.cause?.extra });
};

export function notFoundException(msg , extra) {
    throw new Error(msg, { cause: { statusCode: 404 , extra} });
}

export function badRequestException(msg , extra) {
    throw new Error(msg, { cause: { statusCode: 400 , extra} });
}

export function conflictException(msg , extra) {
    throw new Error(msg, { cause: { statusCode: 409 , extra} });
}

export function unauthorizedException(msg , extra) {
    throw new Error(msg, { cause: { statusCode: 401 , extra} });
}

export function forbiddenException(msg , extra) {
    throw new Error(msg, { cause: { statusCode: 403 , extra} });
}

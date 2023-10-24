"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// let customError: CustomError = require("../utils/errors/customError");
const CustomError_1 = __importDefault(require("../utils/errors/CustomError"));
const devErrors = (res, error) => {
    console.log("Error occured in development mode: ");
    console.error(error);
    if (error instanceof CustomError_1.default) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    }
    else {
        return res.status(500).json({
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    }
};
const prodErrors = (res, error) => __awaiter(void 0, void 0, void 0, function* () {
    // if error raised is CustomError, it will be operational and we sent detailed error msg
    // if other type of error, we only sent limited error msg
    console.log("Error occured in production mode: ");
    console.error(error);
    console.error("statusCode: ", error.statusCode);
    console.error("Message: ", error.message);
    console.error("stack: ", error.stack);
    if (error.isOperational) {
        console.log("entered prodErrors and isOperational = true");
        console.log(error.statusCode);
        // res.statusCode = error.statusCode;
        // res.json({ message: error.message });
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong. Please try again later!",
        });
    }
});
const globalErrorHandler = (error, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "development") {
        devErrors(res, error);
    }
    if (process.env.NODE_ENV === "production") {
        prodErrors(res, error);
    }
});
module.exports = globalErrorHandler;

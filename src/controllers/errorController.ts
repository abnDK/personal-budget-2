// let customError: CustomError = require("../utils/errors/customError");
import { CustomError } from "../utils/errors/CustomError.js";

const devErrors = (res: Response, error: Error) => {
    console.log("Error occured in development mode: ");
    console.error(error);
    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    } else {
        return res.status(500).json({
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    }
};

const prodErrors = async (res: Response, error: Error) => {
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
    } else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong. Please try again later!",
        });
    }
};

export const globalErrorHandler = async (
    error: Error,
    req: Request,
    res: Response,
    next: any
) => {
    if (process.env.NODE_ENV === "development") {
        devErrors(res, error);
    }

    if (process.env.NODE_ENV === "production") {
        prodErrors(res, error);
    }
};

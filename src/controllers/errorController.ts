// let customError: CustomError = require("../utils/errors/customError");
import CustomError from "../utils/errors/CustomError";

const devErrors = (res: Response, error: Error) => {
    console.log("SENDING DEV ERROR");
    if (error instanceof CustomError) {
        console.log("SENDING CUSTOMERROR");
        console.log(error);
        console.log(error.message);
        console.log(error.stack);

        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    } else {
        return res.status(500).json({
            // status: error.statusCode,
            message: error.message,
            stackTrace: error.stack,
            error: error,
        });
    }
};

const prodErrors = async (res: Response, error: Error) => {
    // if error raised is CustomError, it will be operational and we sent detailed error msg
    // if other type of error, we only sent limited error msg

    console.log("entered prodErrors");

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

const invalidCategoryErrorHandler = (err: Error) => {
    console.log("entered invalidCategoryErrorHandler");
    const msg = `Invalid category id set on transaction!`;
    return new CustomError(msg, 404);
};

const unknownIdErrorHandler = (err: Error) => {
    console.log("entered unknownIdErrorHandler");
    const msg = "Invalid transaction id given";
    return new CustomError(msg, 404);
};

const globalErrorHandler = async (
    error: Error,
    req: Request,
    res: Response,
    next: any
) => {
    console.log("entered global error handler with error: ");
    console.log("error: ", error);
    console.log("error code: ", error.code);
    console.log("message: ", error.message);
    console.log("statuscode: ", error.statusCode);
    /* res.status(error.statusCode).json({
        message: error.message,
        test: "test",
        statusCode: error.statusCode,
        status: error.status,
        error: error,
    });
 */
    /* 
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";

    res.status(error.statusCode);
    await res.json({ message: error.message }).catch(next);
 */
    /* await res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
    }); */

    if (process.env.NODE_ENV === "development") {
        console.log("entered global error handler: Development mode");
        devErrors(res, error);
    }

    if (process.env.NODE_ENV === "production") {
        // kan udskiftes med bestemte typer fejl, der ikke skabes
        // i express appen, men andre steder i systemet. Eks. DB'en.
        // Bruges specielle error handlers kan der her skrives
        // en mere brugervenlig error message
        // ref: https://www.youtube.com/watch?v=6jMRV0lMbpE&ab_channel=procademy
        console.log("entered global error handler: Production mode");
        console.log(error.code);
        //console.log(error);
        if (error.code === "23503") {
            console.log("1");
            error = invalidCategoryErrorHandler(error);
            console.log("2");

            // prodErrors(res, error);
            console.log("3");
        } else if (error.message === "unknown id") {
            error = unknownIdErrorHandler(error);

            // prodErrors(res, error);
        }

        prodErrors(res, error);
    }
};

module.exports = globalErrorHandler;

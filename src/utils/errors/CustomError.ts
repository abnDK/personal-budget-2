/**
 * making a CustomError is based on video tutorials from 'procademy' on youtube
 * https://www.youtube.com/watch?v=BZPrK1nQcFI&ab_channel=procademy
 *
 */

interface ICustomError {
    statusCode: number;
    status: string;
    isOperational: boolean;
}

class CustomError extends Error implements ICustomError {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

        // used to control what errors is sent to user in production mode (see errorController.ts and https://www.youtube.com/watch?v=EJLckmUhAco&ab_channel=procademy)
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export = CustomError;

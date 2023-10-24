"use strict";
/**
 *
 * Baseret på https://www.youtube.com/watch?v=xnedbgDoRkA&t=2s&ab_channel=procademy
 * Men skal lige finde ud af hvordan jeg bruger det med det format jeg har skrevet mine routes i her.
 *
 *
 *
 */
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((err) => next(err));
    };
};

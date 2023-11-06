/**
 *
 * Baseret på https://www.youtube.com/watch?v=xnedbgDoRkA&t=2s&ab_channel=procademy
 * Men skal lige finde ud af hvordan jeg bruger det med det format jeg har skrevet mine routes i her.
 *
 *
 *
 */
export default (func: any) => {
    return (req: any, res: any, next: any) => {
        func(req, res, next).catch((err) => next(err));
    };
};

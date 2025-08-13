const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err) => next(err));
        //handles all errors and passes it onto the express error handler 

    }
}

export { asyncHandler }; 
// Page not found errors

const { stack } = require("../routes/authRoutes");

const notFound = (req, res, next) => {
    const error = new Error (`Page Not Found : ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Error Handler for api

const errorHandler = (err, req, res, next) => {
    const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statuscode);
    res.json({
        message: err?.message,
        stack: err?.stack,
    });
};

module.exports = {notFound, errorHandler}
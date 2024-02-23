function sendSuccessResponse(res, message, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data: data
    });
}

function sendErrorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message
    });
}

function sendValidationErrorResponse(res, message, errors, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors: errors
    });
}

module.exports = { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse };
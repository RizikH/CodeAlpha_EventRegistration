function sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data: data });
}

function sendError(res, message, statusCode = 400) {
    return res.status(statusCode).json({ success: false, message: message });
}

module.exports = {
    sendSuccess,
    sendError,
};

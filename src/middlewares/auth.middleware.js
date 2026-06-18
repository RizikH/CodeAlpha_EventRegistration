const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/user.model');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(
            res,
            'Access denied. No token provided or invalid format. Use: Bearer <token>',
            401,
        );
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return sendError(
                res,
                'Access denied. The account associated with this token no longer exists.',
                401,
            );
        }
        req.user = user;
        next();
    } catch (err) {
        return sendError(
            res,
            'Access denied. Your session has expired or the token is invalid. Please log in again.',
            401,
        );
    }
};

module.exports = { authenticate };

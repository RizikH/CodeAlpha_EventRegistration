const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const result = await authService.register(name, email, password, role);
        sendSuccess(res, result, 201);
    } catch (err) {
        sendError(res, err.message, 400);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        sendSuccess(res, result, 200);
    } catch (err) {
        sendError(res, err.message, 401);
    }
};

module.exports = { registerUser, loginUser };

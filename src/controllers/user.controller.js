const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

// --- Helpers ---

// Maps a substring of an error message to an HTTP status code
const getStatus = (message, map) => {
    for (const [key, code] of Object.entries(map)) {
        if (message.includes(key)) return code;
    }
    return 400;
};

// --- Handlers ---

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers(req.query.role);
        sendSuccess(res, users);
    } catch (err) {
        sendError(res, err.message, 500);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        sendSuccess(res, user);
    } catch (err) {
        sendError(res, err.message, err.message.includes('not found') ? 404 : 400);
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await userService.updateUserRole(req.params.id, req.body.role);
        sendSuccess(res, user);
    } catch (err) {
        sendError(res, err.message, err.message.includes('not found') ? 404 : 400);
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        sendSuccess(res, user);
    } catch (err) {
        const status = getStatus(err.message, { 'not found': 404, 'Access denied': 403 });
        sendError(res, err.message, status);
    }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };

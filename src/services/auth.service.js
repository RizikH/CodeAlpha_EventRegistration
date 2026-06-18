const bcrypt = require('bcryptjs');

const userModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const register = async (name, email, password, role) => {
    const existing = await userModel.findByEmail(email);
    if (existing) throw new Error('An account with this email address already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create(name, email, hashedPassword, role);

    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user.id, user.role),
    };
};

const login = async (email, password) => {
    const user = await userModel.findByEmail(email);
    if (!user) throw new Error('Invalid email or password. Please check your credentials and try again.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid email or password. Please check your credentials and try again.');

    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user.id, user.role),
    };
};

module.exports = { register, login };

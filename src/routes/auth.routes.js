const express = require('express');
const router = express.Router();

const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { registerUser, loginUser } = require('../controllers/auth.controller');
const limiters = require('../middlewares/rateLimiter.middleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', limiters.auth, validateLogin, loginUser);

module.exports = router;

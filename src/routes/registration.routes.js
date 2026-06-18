const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const { validateRegistrationId } = require('../validators/registration.validator');
const { cancelRegistration, getMyRegistrations } = require('../controllers/registration.controller');

router.get('/me', authenticate, getMyRegistrations);
router.patch('/:id/cancel', authenticate, validateRegistrationId, cancelRegistration);

module.exports = router;

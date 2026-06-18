const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validateUpdateRole, validateUserId } = require('../validators/user.validator');
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/user.controller');

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), validateUserId, getUserById);
router.patch(
    '/:id/role',
    authenticate,
    authorize('admin'),
    validateUserId,
    validateUpdateRole,
    updateUserRole,
);
router.delete('/:id', authenticate, authorize('admin'), validateUserId, deleteUser);

module.exports = router;

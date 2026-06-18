const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validateCreateEvent, validateUpdateEvent } = require('../validators/event.validator');
const { validateEventId } = require('../validators/registration.validator');
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} = require('../controllers/event.controller');
const { getEventRegistrations, registerForEvent } = require('../controllers/registration.controller');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('organizer', 'admin'), validateCreateEvent, createEvent);
router.patch(
    '/:id',
    authenticate,
    authorize('organizer', 'admin'),
    validateUpdateEvent,
    updateEvent,
);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteEvent);
router.get(
    '/:id/registrations',
    authenticate,
    authorize('organizer', 'admin'),
    getEventRegistrations,
);
router.post('/:id/register', authenticate, validateEventId, registerForEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/performance-reviewController');

router.get('/', controller.getAllReviews);
router.post('/', controller.createReview);
router.put('/:id', controller.updateReview);
router.delete('/:id', controller.deleteReview);

router.get('/employees', controller.getAllEmployees);
router.post('/employees', controller.createEmployee);

module.exports = router;
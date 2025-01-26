const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();
const reviewRouter = require('./reviewRoutes');
// router.param('id', tourController.checkID);

// Nested Routes for Reviews:
// Example endpoints:
// 1. POST /tours/:tourId/reviews
// 2. GET /tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours) //anyone can read the tours without being authenticated
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  ); //only admin,guides  can create a tour

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect, // Ensure the user is authenticated
    authController.restrictTo('admin', 'lead-guide'), // Restrict to specific roles
    tourController.deleteTour, //Controller for deleting the tour
  );

module.exports = router;

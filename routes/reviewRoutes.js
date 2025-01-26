const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
//each router have only acces to their specif routes.
//mergeParams: true is used to merge the params of the parent router with the child router.

// POST /tours/:tourId/reviews
// GET /tours/:tourId/reviews
// POST /reviews

router.use(authController.protect); //protect all the routes below this middleware.
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );
module.exports = router;

// authController.protect = this to do that only users who logged in will be able to access it protected routes.
//authController.restrictTo('user') we restrict it to users only.

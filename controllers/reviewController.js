// const catchAsync = require('./../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

//middleware to set the tour and user id
exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // If the tour ID is not provided in the request body, use the tour ID from the URL parameters
  // Automatically associate the logged-in user's ID with the review
  if (!req.body.user) req.body.user = req.user.id; // If the user ID is not provided in the request body, use the ID of the authenticated user
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

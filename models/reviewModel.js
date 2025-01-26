const mongoose = require('mongoose');
const Tour = require('./tourModel');

//review / rating / createdAt/ ref to tour / ref to user(who wrote this wrote)

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', //this is a reference to other model.
      required: [true, 'Review must belongs to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }, // When we have a virtual property that is not saved in the database but is used for calculations, we need to enable this to include it in the output.
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // a user can write only one review for a tour

//POPULATE
//regular expression
reviewSchema.pre(/^find/, function (next) {
  // In pre middleware, `this` refers to the current query
  // this.populate({
  //   path: 'tour', // name of the field that we want to replace
  //   select: 'name',
  // });
  // this.populate({
  //   path: 'user', // name of the field that we want to replace
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user', // name of the field that we want to replace
    select: 'name photo',
  });
  next();
});

//static method
//static method is called on the model itself
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //using aggregate pipeline to calculate the average rating
  //this points to the model
  const stats = await this.aggregate([
    {
      //selecting all the reviews that match the tour id
      $match: { tour: tourId },
    },
    {
      //grouping the reviews by the tour id
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  //update the tour document
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
//calcAverageRatings is a static method and it is called on the model itself
reviewSchema.post('save', function (next) {
  //this points to the current document
  // Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
  //this.constructor points to the current model
});

//we also need to update the ratings when we update or delete a review, but we will do it next video

//findByIdAndUpdate
//findByIdAndDelete
//for this we use query middleware instead of document middleware because we need to access the current document in the post middleware and we can only do that in document middleware and not in query middleware.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

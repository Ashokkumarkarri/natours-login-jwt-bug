const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); //3rd party validator
// const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      //trim removes all the black space in the beginning and ending.
      maxlength: [40, 'A Tour name must have less or equal then 40 characters'],
      minlength: [10, 'A Tour name must have grater or equal to 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'name should contain string only, no num, no spaces , allowed',
      // ], //3 rd party validator from npm
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either: easy,medium,difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.1,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6666, 46.666, 47, 4.7
      //this will run each time when a new value is set for this field. this will round the value to 1 decimal place.
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      //it will be calculated from our code, it will check how many ratings are then and then it will calculate.
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
          //.this will point to the current doc only when we are creating new document.
          //so this fun will nto work for update tour
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      //trim removes all the black space in the beginning and ending.
      required: [true, 'A Tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image'],
      //now we are just storing the name of the image, we will store the real image from file system later.
    },
    images: [String], //we have an array of strings,
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String, // Mandatory field to define the geometry type
        default: 'Point', // Default is 'Point' for single locations
        enum: ['Point'], // Only 'Point' is allowed
      },
      coordinates: [Number], // Array of numbers [longitude, latitude]
      address: String, // Custom field for the address of the location
      description: String, // Custom field to describe the location
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point', // Single points for each stop
          enum: ['Point'], // Only 'Point' is allowed
        },
        coordinates: [Number], // [longitude, latitude]
        address: String, // Address of the stop
        description: String, // Description of the stop
        day: Number, // Day of the tour for this location
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //this is a reference to other model.
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
//arg1=schema_definition, arg2=options-object

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 for ascending, -1 for descending
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //for geospatial data (longitude, latitude)
//we need to create index for the fields that we are going to query often. It will make the query faster.

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//we can not use the virtual properties while querying, since they are not part of querying. They are part of mongoDB.

//VIRTUAL POPULATE
//name fo the virtual Fields, object of some options
tourSchema.virtual('reviews', {
  //name of the field that we want to reference (name of the model)
  ref: 'Review', //name of the model // ref to the current model
  foreignField: 'tour', //name of the field in other model(in reviewMOdel we have field called "tour")
  localField: '_id', //current model, where that id store in the current tour model ()
});

//4 type of middlewares are there in mongoose: 1.document, 2.query, 3.aggregate, 4.model middleware.
//Document Middleware: runs before  .save() and .create()
//we can use save= for .save(), .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Middleware to fetch and embed guide data
// //will only work creating new documents
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); //array full of promises
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//we can have multiple pre save, post hooks.
//hook is a another terminology for middleware.

// tourSchema.pre('save', function (next) {
//   console.log('will save document ');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
//   //in post we do not have access to :  .this
//   //we have have access to the doc which is currently saved.
// });

//we can have middleware that can run before the event occurred, after the event occurred.
// in case of doc middleware, it suppose to be a save event

//Query Middleware
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   //give me tours which has the secretTour set not equal to true
//   next();
// });

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  //this refers to query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  //this.start is adding a new property to the query object and storing the current timestamp in it
  next();
});

tourSchema.pre(/^find/, function (next) {
  // In pre middleware, `this` refers to the current query
  this.populate({
    path: 'guides', // name of the field that we want to replace
    select: '-__v -passwordChangedAt', // fields to hide
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`API took: ${Date.now() - this.start} milliseconds`);
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //this refers to the aggregate object
//   next();
//   console.log(this);
// });

const Tour = mongoose.model('Tour', tourSchema);
//name of the model  , schema
//always use upper case ofr model names and variable.
// thats why I had used Capital T for the variable so that we will get to know that we are dealing with mode.
module.exports = Tour;

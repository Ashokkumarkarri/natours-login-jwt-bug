const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// filterOBJ function: Filters object keys to allow only specific fields
// This ensures no unauthorized fields are updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    // If the field is allowed, add it to the new object
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj; // Return the filtered object
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// CatchAsync: Utility to handle asynchronous functions and errors
exports.updateMe = catchAsync(async (req, res, next) => {
  // Step 1: Prevent password updates through this route
  // If the request body contains password or passwordConfirm, throw an error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400, // Bad Request error
      ),
    );
  }

  // Step 2: Filter the request body to allow only specific fields
  // The `filterObj` function ensures only 'name' and 'email' are included
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Step 3: Update the user document
  // Using findByIdAndUpdate() to update the user in the database
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Ensures the response contains the updated user data
    runValidators: true, // Ensures all schema validation rules are applied
  });

  // Step 4: Send the updated user data in the response
  res.status(200).json({
    status: 'success', // Response status
    data: {
      user: updatedUser, // Updated user details
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  //in postman we do not see this status code. but even tough it's best practice to send a response.

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
//Do not update password whit this, since it is only for Admins
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

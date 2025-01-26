class APIFeatures {
  constructor(query, queryString) {
    //query=mongose query ,  queryStrig=querystring from express (coming from Route)
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString }; //shallo copy
    const excludedFiles = ['page', 'sort', 'limit', 'fields'];
    excludedFiles.forEach((el) => delete queryObj[el]);

    //1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr)); //To acess query string
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      // query = query.sort(req.query.sort);
      // //sort('price ratingsAverage')
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ');
      // Converting the comma-separated string into space-separated values.
      this.query = this.query.select(field);
      // Passing the selected fields to the .select() method to specify which fields should be included in the response.
    } else {
      this.query = this.query.select('-__v');
      // Excluding the '__v' field (version key created by MongoDB) from the response.
    }
    return this;
  }
  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllTours = async (req, res) => {
  try {
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports = APIFeatures;

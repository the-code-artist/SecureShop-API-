const mongoose = require("mongoose");
//creating schema for products
/*
const productSchema = mongoose.Schema({
  name: String,
  image: String,
  // countInStock: Number,
  // error generation
  countInStock: {
    type: Number,
    //required is used to specify the must mention fields
    required: true,
  },
});
*/
//creating schema for all the products according to required fields based on the draft model
const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

//creating model for schema
// const Product = mongoose.model("Product", productSchema);

//exporting the model
exports.Product = mongoose.model("Product", productSchema);

const express = require("express");
const app = express();
require("dotenv/config");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
//importing product from product model..start with capital for same naming everywhere
const Product = require("./models/product");
const authJwt=require("./helper/jwt")
const errorHandler=require("./helper/error-handler")
//importing routes
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

//importing cors
const cors = require("cors");
const protection = require("./helper/jwt");

//before starting any application we need to enable cors
app.use(cors());
app.use("*", cors());

//public routes thru environment variables
const api = process.env.API_URL;

//middle ware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
//importing router and using as middleware
//it means application uses product router coming from the file mentioned
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//database connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("connection to db is successfull...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen("3000", () => {
  console.log(api);
  console.log("server is running on port no 3000...");
});

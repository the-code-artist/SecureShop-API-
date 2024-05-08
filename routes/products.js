const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //strore front end received file type
    const isValid = FILE_TYPE_MAP[file.mimetype];
    //create a new error which is later passed as a parameter in call back function
    let uploadError = new Error("invalid image type");
    //check if valid or not
    if (isValid) {
      uploadError = null;
    }
    //setting error in callback
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    //manipulating user created file name to a file name which doesnt have any spaces
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });
//sample type of get method

// app.get(`${api}/products`, (req, res) => {
//   // dummy data set like a json server which is tested to send data to front end
//   const product = {
//     id: 1,
//     name: "hair dresser",
//     image: "some_url",
//   };
//   res.send(product);

// });

//another type of get method for displaying data in db on front end
//to get a list of all products in db
/*
router.get(`/`, async (req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});
*/
//to get a specific product use id
router.get(`/:id`, async (req, res) => {
  const specProduct = await Product.findById(req.params.id);
  if (!specProduct) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(specProduct);
});
/*
//to get only specific fields of a product
router.get(`/`, async (req, res) => {
  const productField = await Product.find().select('name');
  if (!productField) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productField);
});
*/
//to get only specific fields of a specific product
/*
router.get(`/:id`, async (req, res) => {
  // const specProduct = await Product.findById(req.params.id);
  // if (!specProduct) {
  //   res.status(500).json({
  //     success: false,
  //   });
  // }
  const productField = await Product.findById(req.params.id).select('name image brand -_id');
  if (!productField) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productField);
  
});
*/
//to get a product details by id along with all the category details of the product with which it is linked to...
router.get(`/:id`, async (req, res) => {
  const specProduct = await Product.findById(req.params.id).populate(
    "category",
  );
  if (!specProduct) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(specProduct);
});
/*
router.post(`/`, (req, res) => {
  //getting data from front end
  // const newProduct = req.body;

  //printing response on backend and frontend
  // console.log(newProduct);
  // res.send(newProduct);

  //pushing it to db
  //creating a new product with updations or addons details
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });
  //saving it to database and checking the status
  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});
*/
//post request to create a new post and save it to db
router.post(`/`, async (req, res) => {
  const check = await Category.findById(req.body.category);
  if (!check) return res.status(400).send("Invalid Category");
  //importing filename and setting a base path for file name where we are going to upload our image files
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  //checking if file is beging sent or not
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    //change image field for local storing of image
    image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");
  if (product) {
    res.send(product);
  }
});
//updating a product details in db according to front end data
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true },
  );

  if (!product) return res.status(500).send("the product cannot be updated!");

  res.send(product);
});
// deleting a product using its id from the database
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
//for getting total count of products in database
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  //for sending json data as product count to admin panel
  res.send({
    productCount: productCount,
  });
});
//get featured products list
/*

router.get(`/get/featured`, async (req, res) =>{
  const featuredProducts = await Product.find({isFeatured:true})

  if(!featuredProducts) {
      res.status(500).json({success: false})
  } 
  res.send(featuredProducts);
})
*/
//get featured products according to count
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});
//getting all products of a particular category
router.get(`/`, async (req, res) => {
  //url format is
  // localhost:3000/api/v1/products?categories=2342342,234234
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  //since we are connecting with another mongoose table thus use populate method
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});
router.put(  
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true },
    );
    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  },
);

module.exports = router;

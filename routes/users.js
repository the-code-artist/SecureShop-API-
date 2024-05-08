const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//posting a new user to database
//same as craeating a new product or new category
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  //saving it to daatbase and then check status of work done or not
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});
//to register a new user
router.post('/register', async (req,res)=>{
  let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
  })
  user = await user.save();

  if(!user)
  return res.status(400).send('the user cannot be created!')

  res.send(user);
})

//getting a list of users
/*
router.get("/", async (req, res) => {
  const check = await User.find();
  if (!check) {
    res.status(500).json({ success: false });
  }
  res.send(check);
});
*/
//sending only a single user data
router.get("/:id", async (req, res) => {
  // const user = await User.findById(req.params.id).select("-passwordHash -zip");
  //to send only a particular fields use
  const user = await User.findById(req.params.id).select("name email");
  if (!user) {
    res.status(500).json({ success: false });
  }
  res.send(user);
});
//getting all fields except few fields like password hash and zip code
router.get("/", async (req, res) => {
  const check = await User.find().select("-passwordHash -zip");
  if (!check) {
    res.status(500).json({ success: false });
  }
  res.send(check);
});
//creating a new user
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret=process.env.secret
  if (!user) {
    res.status(400).send("user not found");
  }
  //check if user is there or not and if there  then send details
  /*
  res.status(200).send(user)
  */
  //checking for password that is sent from frontend and existing backend password
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    //generating a jwt token
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin:user.isAdmin 
      }, 
      secret,
      {expiresIn:"1d"}
    );
    //sending status of authentication
    // res.status(200).send('user authenticated')
    //sending data in the form of field:data
    res.send({ 
      status: "user authenticated",
      user: user.email,
      tokenCreated: token,
    });
  } else {
    res.status(400).send("password is wrong!!");
  }
});
//for getting total count of users in database
router.get(`/get/count`, async (req, res) =>{
  const userCount = await User.countDocuments()

  if(!userCount) {
      res.status(500).json({success: false})
  } 
  //for sending json data as product count to admin panel
  res.send({
      userCount: userCount
  });
})
// deleting a user using its id from the database 
router.delete('/:id', (req, res)=>{
  User.findByIdAndRemove(req.params.id).then(user =>{
      if(user) {
          return res.status(200).json({success: true, message: 'the user is deleted!'})
      } else { 
          return res.status(404).json({success: false , message: "user not found!"})
      }
  }).catch(err=>{
     return res.status(500).json({success: false, error: err}) 
  })
})
module.exports = router;

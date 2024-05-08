const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const { OrderItem } = require("../models/order-item");
//getting a lis of products
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});
//getting a product by id and also learning how to populate a fields inside a array
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    //populating fields inside an array
    //we take them as an objects and populate
    .populate({
        //set path (at root level it is array name itself)and then apply populate methods again by setting required field path and then applying populate on required field 
      path: "orderItems", 
      populate: {
          //here we are populating entire product column of order items
        path: "product",
        //further populating category column of product level
        populate: "category",
        //in this way multiple inner fields can be populated
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});
//creating a new order
router.post("/", async (req, res) => {
  //taking data from reference table and storing it in order item ids variable
  //map helps in iterating thru all the order array
  //it takes an async function as a prameter with a variable in it which is used to access elements of order-item.js
  //to resolve all the pending promises Promis.all() method
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      //creating of new order and storing it in another variable
      //new imported table name({})
      //inner fields are built according to original table schema fields
      //since we are getting an incoming data always make a new data set for it and then save it to db
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      //save it to db
      newOrderItem = await newOrderItem.save();
      //return the id so that we can store it in relational tables
      return newOrderItem._id;
    }),
  );
  //to check errors or not expected functioning always console log it
  //console.log(orderItemIds)
  //assign a new final variable which is used in relationals schema later
  //this new variale holds our final data after all things and pending promises are resolved..we are acheiveing this using await method
  const orderItemsIdsResolved = await orderItemsIds;
//traverse thru all orderitems using map
//using item id take a varible by OrderItem.findbyid() and store product details->price details in it using populate method
//then total price is found ..and return total price
//in this way math is implemented in backend
  const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
      const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice
  }))
  //here total price of all the ordered items is sent as individual sum in an array
  //to sum all of them use beloow reduce methods
  //reduce will add all numbers in an array and it is initialised to 0 

  const totalPrice = totalPrices.reduce((a,b) => a +b , 0);
  //schema built according to model
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    //its like calling a variable function above..dont use () at end
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});
//updating a product status
router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})
//deleting a order and order items 
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            //to remove all the associatede orderItems of the selected order we need to iterate thru each of them using map and
            //then select each orderitem as orderItem (this is used as id to remove order item) and remove it from OrderItem
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})
//getting total sales on a day
router.get('/get/totalsales', async (req, res)=> {
    //get total sales directly from mongodb using mongoose and method used is aggregate
    //here we are grouping all the tables into 1 table and then use sum on a particular column to get sum of all the values in that column
    //here sum is all sum of all fields named total price
    //where total price is a field in every orders and also we calculated before itself
    //group should have a id thus mention it and set it to null
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }
    //here to not have id we are popping the array completely
    // res.send({totalsales: totalSales})
    // o/p is
    // {
    //     "totalsales": [
    //         {
    //             "_id": null,
    //             "totalsales": 50
    //         }
    //     ]
    // }
    // instead we pop the entrire 1st {} from array and then insert totalsales values which is calculated and stored above
    res.send({totalsales: totalSales.pop().totalsales})
})
//total count of orders 

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()
 
    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})
//get all specific user ordered products in a sorted order
// here the id that we are passing is user id not order id
//in this way we can take other table ids also and populate present table fields or someother linked table fields
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

module.exports = router;
 
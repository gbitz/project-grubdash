const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//Validation
function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Must include a ${propertyName}` });
    };
}


function validateDishes(req, res, next) {
  const {data: {dishes} = {} } = req.body;

  if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
    dishes.forEach((dish, index) => {
      if (dish.quanity === 0 || !dish.quantity || !Number.isInteger(dish.quantity)) {
          return next({status:400, message:`Dish ${index} must have a quantity that is an integer greater than 0`});
      }
    })
    return next();
  }
  next({status: 400, message: `dish list is not valid required`})
}

function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder) {
        res.locals.orders = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `order id not found ${orderId}`
    })
}
// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res){
    res.json( {data:orders} )
}

function create(req, res) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body
    const newId = new nextId()

    const newOrder = {
        id: newId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }

    orders.push(newOrder);
    res.status(201).json({data: newOrder}); 

}

function read(req, res) {
    const foundOrder = res.locals.orders;
    res.json({data: foundOrder});
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        validateDishes,
        create
    ],
    read: [
        orderExists,
        read
    ]
}
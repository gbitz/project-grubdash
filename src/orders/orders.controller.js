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

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
//         bodyDataHas("status"),
        bodyDataHas("dishes"),
        validateDishes,
        create
    ]
}
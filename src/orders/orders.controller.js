const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//Validation
// function bodyDataHas(propertyName) {
//     return function (req, res, next) {
//       const { data = {} } = req.body;
//       if (data[propertyName]) {
//         return next();
//       }
//       next({ status: 400, message: `Must include a ${propertyName}` });
//     };
// }

function requestBodyHasDeliverTo(req, res, next) {
    const { data: {deliverTo} = {} } = req.body;
    if (deliverTo) {
        return next();
    }
    next({status:400, message: `must include a deliverTo`})    
} 

function requestBodyHasMobileNumber(req, res, next){
    const { data: {mobileNumber} = {} } = req.body;
    if (mobileNumber) {
        return next();
    }
    next({status:400, message: `must include a mobileNumber`})
}

function requestBodyHasDishes(req, res, next){
    const { data: {dishes} = {} } = req.body;
    if (dishes) {
        return next();
    }
    next({status:400, message: `must include a dish`})
}

function requestBodyHasStatus(req, res, next){
    const { data: {status} = {} } = req.body;
    if (status) {
        return next();
    }
    next({status:400, message: `must include a status`})
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
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `order id not found ${orderId}`
    })
}

function dataIdMatchesParamId(req, res, next) {
    const {data: {id} } =req.body;
    const {orderId} = req.params;
    if (orderId === id || !id) {
      return next()
    } else {
      next({status: 400, message: `param id "${orderId}" does not match order ${id} `})
    }
}

function validateStatus(req, res, next) {
    const foundOrder = res.locals.order
    const {data: {status} = {} } = req.body;
    if (status === foundOrder.status) {
        return next();
    } else {
        if (foundOrder.status === "delivered" && foundOrder.status !== status) {
            return next({status:400, message: "A delivered order cannot be changed"})
        } else if (status === "delivered" ||status === "pending" ||status === "preparing" ||status === "out-for-delivery" ) {
            return next()
        }
        return next({status: 400, message:`Order must have a status of pending, preparing, out-for-delivery, delivered`}) 
    }
}

function pendingCheck(req, res, next) {
    const foundOrder = res.locals.order;
    if (foundOrder.status !=="pending") {
        return next({status:400, message: "An order cannot be deleted unless it is pending"})
    }
    return next();
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
    const foundOrder = res.locals.order;
    res.json({data: foundOrder});
}

function update(req, res) {
    foundOrder = res.locals.order;

    const {data:  {deliverTo, mobileNumber, status, dishes} = {} } = req.body;
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;

    res.json({ data:foundOrder })
}

function destroy(req, res) {
    const {orderId} = req.params
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [
        // bodyDataHas("deliverTo"),
        // bodyDataHas("mobileNumber"),
        // bodyDataHas("dishes"),
        requestBodyHasDeliverTo,
        requestBodyHasMobileNumber,
        requestBodyHasDishes,
        validateDishes,
        create
    ],
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        // bodyDataHas("deliverTo"),
        // bodyDataHas("mobileNumber"),
        // bodyDataHas("dishes"),
        // bodyDataHas("status"),
        requestBodyHasDeliverTo,
        requestBodyHasMobileNumber,
        requestBodyHasDishes,
        requestBodyHasStatus,
        dataIdMatchesParamId,
        validateStatus,
        validateDishes,
        update  
    ],
    delete: [
        orderExists,
        pendingCheck,
        destroy
    ]
}
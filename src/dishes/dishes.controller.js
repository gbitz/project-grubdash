const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Validation
// function bodyDataHas(propertyName) {
//     return function (req,res,next) {
//         const {data = {} } = req.body;
//         if (data[propertyName]) {
//             return next();
//         }
//         next({status : 400, message: `Must include a ${propertyName}` });
//     }
// }

function requestBodyHasName(req, res, next){
    const { data: {name} = {} } = req.body;
    if (name) {
        return next();
    }
    next({status:400, message: `must include a name`})
}

function requestBodyHasDescription(req, res, next){
    const { data: {description} = {} } = req.body;
    if (description) {
        return next();
    }
    next({status:400, message: `must include a description`})
}

function requestBodyHasPrice(req, res, next){
    const { data: {price} = {} } = req.body;
    if (price) {
        return next();
    }
    next({status:400, message: `must include a price`})
}

function requestBodyHasImageUrl(req, res, next){
    const { data: {image_url} = {} } = req.body;
    if (image_url) {
        return next();
    }
    next({status:400, message: `must include a image_url`})
}

function validPrice(req, res, next) {
    const {data: {price} } =req.body;
    if (price < 0 || !Number.isInteger(price)) {
        next({status: 400, message: `price not valid`})
    }
    return next();
}


function dishExists(req,res,next) {
    const {dishId} =  req.params;
    const foundDish = dishes.find((dish) => dishId === dish.id);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404
    })
}

function dataIdMatchesParamId(req, res, next) {
      const {data: {id} } =req.body;
      const {dishId} = req.params;
      if (dishId === id || !id) {
        return next()
      } else {
        next({status: 400, message: `param id "${dishId}" does not match dish ${id} `})
      }

}
// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
    res.json({data: dishes})
}

function create(req, res) {
    const {data: {name, description, price, image_url} = {} } = req.body;
    const newId = new nextId();
    const newDish =  {
        id: newId,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };
    dishes.push(newDish);
    res.status(201).json({data:newDish});
}

function read(req, res) {
    res.json({data: res.locals.dish})
}

function update(req, res) {
    const foundDish = res.locals.dish;
    
    const {data: {name,
                  description,
                  price, 
                  image_url } = {} } = req.body

    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;
  
    res.json({data:foundDish})
}

module.exports = {
    list,
    create : [
        // bodyDataHas("name"),
        // bodyDataHas("description"),
        // bodyDataHas("price"),
        // bodyDataHas("image_url"),
        requestBodyHasName,
        requestBodyHasDescription,
        requestBodyHasPrice,
        requestBodyHasImageUrl,
        validPrice,
        create
    ],
    read : [
        dishExists,
        read
    ],
    update : [
        dishExists,
        // bodyDataHas("name"),
        // bodyDataHas("description"),
        // bodyDataHas("price"),
        // bodyDataHas("image_url"),
        requestBodyHasName,
        requestBodyHasDescription,
        requestBodyHasPrice,
        requestBodyHasImageUrl,
        dataIdMatchesParamId,
        validPrice,
        update
    ]


}
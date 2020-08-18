// Importing external packages - CommonJS
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { response } = require("express");
const dataAccessLayer = require("./dataAccessLayer");
const { ObjectId, ObjectID } = require("mongodb");
dataAccessLayer.connect();

// Creating my Server
const app = express();

app.use(cors());

// Installing the body-parser middleware
// Allow us to read JSON from requests
// (side note: if you do not install the body-parser than
// read the JSON from require)
app.use(bodyParser.json());

//Read in JSON FILE (mock database)
//let products = [];

//try {
// products = JSON.parse(fs.readFileSync("products.json")).products;
//} catch (error) {
//  console.log("No existing file.");
//}

// Defining our HTTP Resource Methods
// API Endpoints
// Routes

// GET ALL PRODUCTS
// GET /api/products
app.get("/api/products", async (request, response) => {
  const products = await dataAccessLayer.findAll();
  response.send(products);
});

// Get A SPECIFIC PRODUCT BY ID
// Get /api/products { id: 123, name: 'apples', price: 1.99}
app.get("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`Product ID ${productId} cannot be found.`);
    return;
  }
  const productQuery = {
    _id: new ObjectId(productId),
  };
  let product;

  try {
    product = await dataAccessLayer.findOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with ID ${productId} not found!`);
  }
  response.send(product);
});

// UPDATE EXISTING PRODUCT BY ID
// POST /api/products/:id {id: 123, name: 'apples', price: 4.99}
app.post("/api/products", async (request, response) => {
  // Read the json body from the request
  const body = request.body;
  //Validate the json body to have required properties
  /* Required Properties:
-name
-price
-category
*/
  if (!body.name || !body.price || !body.category) {
    response.send(
      "Bad Request. Validation Error. Missing name, price, or category."
    );
    return;
  }
  if (typeof body.name !== "string") {
    response.status(400).send("The name parameter must be of type string");
    return;
  }
  if (typeof body.category !== "string") {
    response.status(400).send("The category parameter must be of type string");
    return;
  }
  if (body.price && isNaN(Number(body.price))) {
    response
      .status(400)
      .send("The price must be of type price and greater than 0");
  }

  await dataAccessLayer.insertOne(body);

  response.send();
});
//PUT /api/products/:id
app.put("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  const body = request.body;
  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`Product ID ${productId} cannot be found.`);
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };
  try {
    await dataAccessLayer.updateOne(productQuery, body);
  } catch (error) {
    response.status(404).send(`Product with ID ${productId} not found!`);
    return;
  }

  response.send();
});

// DELETE EXISTING PRODUCTS BY ID
// DELETE /api/products/:id
app.delete("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`Product ID ${productId} cannot be found.`);
    return;
  }
  const productQuery = {
    _id: new ObjectId(productId),
  };
  try {
    await dataAccessLayer.deleteOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with ID ${productId} not found!`);
    return;
  }

  response.send();
});
// Starting my server
const port = process.env.PORT ? process.env.PORT : 3005;
app.listen(port, () => {
  console.log("Grocery API Server Started!");
});

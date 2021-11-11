// *****************************************************************************
// *****     DEPENCIES     *****************************************************
// *****************************************************************************
const express = require("express");
const app = express();

// *****************************************************************************
// *****     DECLARE SWAGGER     ***********************************************
// *****************************************************************************
const swaggerUi = require("swagger-ui-express");
swaggerDocument = require("./swagger.json");

// *****************************************************************************
// *****     BODY JSON SUPPORT     *********************************************
// *****************************************************************************
const bodyParser = require("body-parser");

app.use(bodyParser.json());

//DATABASE CONECTION
const { Pool } = require("pg");
const { query } = require("express");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: "tute",
  port: 5432,
});

//API-ENDPOINTS
app.get("/hotels", function (req, res) {
  const hotelNameQuery = req.query.hotel;
  let query = "SELECT * FROM hotels ORDER BY name";

  if (hotelNameQuery) {
    query = `SELECT * FROM hotels WHERE UPPER(name) LIKE UPPER('%${hotelNameQuery}%') ORDER BY name`;
  }
  pool
    .query(query)
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/hotels/:hotelId", (req, res) => {
  const hotelId = req.params.hotelId;

  pool
    .query("SELECT * FROM hotels WHERE id = $1", [hotelId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.log(e));
});

app.get("/customers", (req, res) => {
  pool
    .query("SELECT * FROM customers ORDER BY name")
    .then((result) => res.json(result.rows))
    .catch((e) => console.log(e));
});

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;
  pool
    .query("SELECT * FROM customers WHERE id = $1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.log(e));
});
app.get("/customers/:customerId/bookings", (req, res) => {
  const customerId = req.params.customerId;
  pool
    .query(
      "SELECT * FROM customers c JOIN bookings b on c.id = b.customer_id WHERE c.id = $1",
      [customerId]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.log(e));
});

app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  console.log(newHotelName);
  console.log(newHotelRooms);
  console.log(newHotelPostcode);

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

  pool
    .query("INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)", [
      newHotelName,
      newHotelRooms,
      newHotelPostcode,
    ])
    .then((result) => {
      res.send("Hotel created!");
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("Hotel with that name already exists");
    });
});

app.post("/customers", (req, res) => {
  const customerName = req.body.name;
  const customerEmail = req.body.email;
  const customerAdress = req.body.address;
  const customerCity = req.body.city;
  const customerPostcode = req.body.postcode;
  const customerCountry = req.body.country;

  pool
    .query("SELECT * FROM customers WHERE name=$1", [customerName])
    .then((result) => {
      if (result.rows.length > 0) {
        res
          .status(400)
          .send(
            "A customer with the same name already exist. Try another one."
          );
      } else {
        const query =
          "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
        pool
          .query(query, [
            customerName,
            customerEmail,
            customerAdress,
            customerCity,
            customerPostcode,
            customerCountry,
          ])
          .then(() => res.status(200).send("customer created!"))
          .catch((e) => console.log(e));
      }
    });
});

app.patch("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const newEmail = req.body.email;
  const newAddress = req.body.address;
  const newPostcode = req.body.postcode;
  const newCity = req.body.city;
  const newCountry = req.body.country;
  if (newEmail) {
    pool
      .query("UPDATE customers SET email=$1 WHERE id=$2", [
        newEmail,
        customerId,
      ])
      .then(() => res.send(`Customer ${customerId} updated!`))
      .catch((e) => console.error(e));
  } else {
	  res.send("please insert a valid email.")
  }
});
app.patch("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const newAddress = req.body.address;
  if (newAddress) {
    pool
      .query("UPDATE customers SET address=$1 WHERE id=$2", [
        newAddress,
        customerId,
      ])
      .then(() => res.send(`Address of customer ${customerId} updated!`))
      .catch((e) => console.error(e));
  }
});

app.delete("/customers/:customerId", function (req, res) {
	const customerId = req.params.customerId;
  
	pool
	  .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
	  .then(() => {
		pool
		  .query("DELETE FROM customers WHERE id=$1", [customerId])
		  .then(() => res.send(`Customer ${customerId} deleted!`))
		  .catch((e) => console.error(e));
	  })
	  .catch((e) => console.error(e));
  });
app.delete("/hotels/:hotelId", function (req, res) {
	const hotelId = req.params.hotelId;
  
	pool
	  .query("DELETE FROM bookings WHERE hotel_id=$1", [hotelId])
	  .then(() => {
		pool
		  .query("DELETE FROM hotels WHERE id=$1", [hotelId])
		  .then(() => res.send(`Hotel ${hotelId} deleted!`))
		  .catch((e) => console.error(e));
	  })
	  .catch((e) => console.error(e));
  });


//MAIN
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});

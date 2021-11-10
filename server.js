
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

const pool = new Pool(
{
	user: "postgres",
	host: "localhost",
	database: "cyf_hotels",
	password: "tute",
	port: 5432,
});


//API-ENDPOINTS
app.get("/hotels", function (req, res)
{
	const hotelNameQuery = req.query.hotel;
	let query = "SELECT * FROM hotels ORDER BY name";

	if(hotelNameQuery) {
		query = `SELECT * FROM hotels WHERE UPPER(name) LIKE UPPER('%${hotelNameQuery}%') ORDER BY name`
	}
	pool.query(query)
		.then((result) => res.json(result.rows))
		.catch((e) => console.error(e));
});

app.get("/hotels2/:hotelId", (req, res) => {
	const hotelId = req.params.hotelId;
	
	pool
	.query("SELECT * FROM hotels WHERE id = $1", [hotelId])
	.then((result)=> res.json(result.rows))
	.catch((e)=> console.log(e))
})

app.post("/hotels", function (req, res)
{
	const newHotelName = req.body.name;
	const newHotelRooms = req.body.rooms;
	const newHotelPostcode = req.body.postcode;

	console.log(newHotelName);
	console.log(newHotelRooms);
	console.log(newHotelPostcode);

	if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
		return res.status(400)
				  .send("The number of rooms should be a positive integer.");
	}


	pool.query("INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)",
			   [newHotelName, newHotelRooms, newHotelPostcode])
		.then((result) =>
		{
			res.send("Hotel created!");
		})
		.catch( (error) => {
			console.error(error);
			res.status(400)
			   .send("Hotel with that name already exists");
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
    .then((result)=> {
        if (result.rows.length > 0) {
            res
            .status(400)
            .send("A customer with the same name already exist. Try another one.")
        } else {
            const query = "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
        pool
        .query(query, [customerName, customerEmail, customerAdress, customerCity, customerPostcode, customerCountry])
        .then(() => res
            .status(200)
            .send("customer created!"))
        .catch((e)=> console.log(e));
        }
    })
})

//MAIN
app.use(
	'/swagger',
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocument)
);

app.listen(3000, function ()
{
	console.log("Server is listening on port 3000. Ready to accept requests!");
});


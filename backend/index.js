const express = require('express');
const app = express()
const morgan = require("morgan");
const greenhouse = require('./routes/greenhouses');

// -------------------------------- CORS --------------------------------

// Restricting the allowed origins
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3001', 'http://127.0.0.1:52560', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Browser will cache the CORS preflight response for 24 hours
};
app.use(cors(corsOptions));

// -----------------------------------------------------------------------------

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://localhost/greenhouses")
  .then(()=>console.log("Connected to database"))
  .catch((error)=> console.error("Error", error));

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(morgan("tiny"));
app.use("/greenhouses", greenhouse);

app.get('/', function (req, res) {
  res.write("<!DOCTYPE html");
  res.write("<html style='font-family: Roboto, Arial, sans-serif;'>");
  res.write("<head><title>REST API</title></head>");
  res.write("<body><p>/greenhouseObject is implemented</p></body>");
  res.write("</html>");
  res.end(); 
})

app.listen(3000);
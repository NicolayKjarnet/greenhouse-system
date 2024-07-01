const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const GreenhouseModel = require("../models/greenhouseModel");

router.get("/", async function (req, res) {
  const objects = await GreenhouseModel.find();
  res.status(200).json(objects);
});

router.post("/:id", async function (req, res) {
  try {
    const { temperature, humidity, light } = req.body;
    const { id } = req.params;
    const greenhouseInstance = new GreenhouseModel({ id, temperature, humidity, light });
    const savedGreenhouse = await greenhouseInstance.save();
    res.status(201).json(savedGreenhouse);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;

// router.post("/", async function (req, res, next) {
//   try {
//     //TODO Fikse dette objektet så det samsvarer med model
//     const greenhouseInstance = new GreenhouseModel([{
//       temperature: req.body.temperature,
//       humidity: req.body.humidty,
//       light: req.body.light,
//     }]);
//     const saveResult = await greenhouseInstance.save();
//     res.status(201).json(saveResult);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

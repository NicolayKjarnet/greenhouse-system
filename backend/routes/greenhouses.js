const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const greenhouseModel = require("../models/greenhouseModel");

// Get by greenhouseId
router.get("/:id", async (req, res) => {
  try {
    const greenhouses = await greenhouseModel.find({ greenhouseId: req.params.id });
    res.status(200).json(greenhouses);
  } catch (error) {
    res.status(404).json(error);
  }
});

// Get all
router.get("/", async (req, res) => {
  const objects = await greenhouseModel.find();
  res.status(200).json(objects);
});

// Get latest (number) posts
router.get("/latest/:max", async (req, res) => {
  try {
    const greenhouses = await greenhouseModel.find()
      .limit(req.params.max)
      .sort({ modifiedDate: "desc" });
    res.status(200).json(greenhouses);
  } catch (error) {
    res.status(404).json(error);
  }
});

// Post new instance
router.post("/", async (req, res) => {
  try {
    const { temperature, humidity, light, greenhouseId } = req.body;
    const greenhouseInstance = new greenhouseModel({ temperature, humidity, light, greenhouseId });
    const savedInstance = await greenhouseInstance.save();
    res.status(201).json(savedInstance);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update instance
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { temperature, humidity, light } = req.body;

  try {
    const greenhouse = await greenhouseModel.findById(id);

    if (!greenhouse) {
      return res.status(404).json({ message: 'Greenhouse not found' });
    }

    greenhouse.temperature = temperature;
    greenhouse.humidity = humidity;
    greenhouse.light = light;

    await greenhouse.save();

    res.json(greenhouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all instances
router.delete("/", async (req, res) => {
  try {
    const result = await greenhouseModel.deleteMany();
    res.status(200).json(result);
  } catch (error) {
    return res.status(404).json("{}");
  }
});

// Delete by id
router.delete("/:id", async (req, res) => {
  try {
    const result = await greenhouseModel.deleteOne({ greenhouseId: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    return res.status(404).json("{}");
  }
});

module.exports = router;
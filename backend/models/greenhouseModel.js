const mongoose = require("mongoose");
const { Schema } = mongoose;

const greenhouseSchema = new Schema({
  greenhouseId: {type: Number, required: true},
  temperature: {type: Number},
  humidity: {type: Number},
  light: {type: Number},
  modifiedDate: {type:Date, default: Date.now}
});

module.exports = mongoose.model("Greenhouse", greenhouseSchema);
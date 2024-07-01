const mongoose = require("mongoose");
const { Schema } = mongoose;

const greenhouseSchema = new Schema({
  id: {type: String},
  temperature: Number,
  humidity: Number,
  light: Number
}, { timestamps: true });

module.exports = mongoose.model("Greenhouse", greenhouseSchema);

// //TODO Fikse dette objektet så det fungerer samme med route
// const greenhouseSchema = new Schema([
//   {
//   temperature: String,
//   humidity: String,
//   light: String,
//   }
//   // modifiedDate: {type: Date, default: Date.now},
// ]);

// module.exports = mongoose.model("Greenhouse", greenhouseSchema);


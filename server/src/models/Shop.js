const mongoose = require("mongoose");
const { toJSONOptions } = require("./schemaOptions");

const shopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    priceSelector: { type: String, required: true, trim: true },
    titleSelector: { type: String, trim: true },
    // Marks this shop as RedStore itself. Only one shop should have isOwn: true
    // at any given time — this is enforced in the controller layer.
    isOwn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    ...toJSONOptions,
  }
);

module.exports = mongoose.model("Shop", shopSchema);

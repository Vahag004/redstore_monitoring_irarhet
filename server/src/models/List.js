const mongoose = require("mongoose");
const { toJSONOptions } = require("./schemaOptions");

// --- Link subdocument (product -> shop URL mapping) ---
const linkSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    url: { type: String, required: true, trim: true },
  },
  {
    _id: true,
    ...toJSONOptions,
  }
);

// --- Product subdocument ---
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    model: { type: String, trim: true },
    // URL of this exact product on the RedStore website itself — scraped
    // with the "own" shop's selectors to obtain "our price" for comparison.
    redstoreUrl: { type: String, required: true, trim: true },
    links: { type: [linkSchema], default: [] },
  },
  {
    timestamps: true,
    ...toJSONOptions,
  }
);

// --- List document ---
const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    products: { type: [productSchema], default: [] },
  },
  {
    timestamps: true,
    ...toJSONOptions,
  }
);

module.exports = mongoose.model("List", listSchema);
module.exports.productSchema = productSchema;
module.exports.linkSchema = linkSchema;

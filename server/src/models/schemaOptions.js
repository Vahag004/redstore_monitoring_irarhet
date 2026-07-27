// Shared toJSON transform: converts _id -> id (string) and removes __v.
// Applied recursively to nested subdocuments (products, links) as well,
// since Mongoose runs toJSON transforms on subdocuments individually
// when { toJSON: { transform } } is set on their own schema too.

function transform(doc, ret) {
  ret.id = ret._id ? ret._id.toString() : ret.id;
  delete ret._id;
  delete ret.__v;
  return ret;
}

const toJSONOptions = {
  toJSON: {
    virtuals: true,
    transform,
  },
};

module.exports = { toJSONOptions, transform };

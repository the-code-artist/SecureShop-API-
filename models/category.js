const mongoose = require("mongoose");
//creating category schema according to basic model
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
});
//to change -id to id to make it more frontend friendly
categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

categorySchema.set('toJSON', {
  virtuals: true,
});
exports.Category = mongoose.model("Category", categorySchema);

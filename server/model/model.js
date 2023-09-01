const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  order: {
    type: Number,
  },
});

questionSchema.plugin(AutoIncrement, {inc_field: 'order'});

const Questiondb = mongoose.model('Questiondb', questionSchema);

module.exports = Questiondb;








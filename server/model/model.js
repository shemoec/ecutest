const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
});

const Questiondb = mongoose.model('Questiondb', questionSchema);

module.exports = Questiondb;








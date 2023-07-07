const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  resultadotest: {
    type: String,
    default: ''
  }
});

const User = mongoose.model("User", userSchema);
  
module.exports = User;

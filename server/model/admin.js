const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true
  },
  contrasena: {
    type: String,
    required: true
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;


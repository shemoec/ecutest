const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true
  },
  universidades: [{
    institucion: {
      type: String,
      required: true
    },
    carrera: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  }]
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;

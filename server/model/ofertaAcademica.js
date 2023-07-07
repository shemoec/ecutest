const mongoose = require('mongoose');

const ofertaAcademicaSchema = new mongoose.Schema({
  institucion: {
    type: String,
    required: true
  },
  carrera: {
    type: String,
    required: true
  },
  provincia: {
    type: String,
    required: true
  },
  ciudad: {
    type: String,
    required: true
  },
  jornada: {
    type: String,
    required: true
  },
  modalidad: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});

const OfertaAcademica = mongoose.model('OfertaAcademica', ofertaAcademicaSchema);

module.exports = OfertaAcademica;

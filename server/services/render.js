const axios = require('axios');
const { obtenerEstadisticas } = require('../controller/controller');
const OfertaAcademica = require('../model/ofertaAcademica');
const Result = require('../model/result');

exports.homeRoutes = async (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;

  try {
    const response = await axios.get('http://localhost:3000/api/questions');
    res.render('dashboard', { questions: response.data, loggedIn });
  } catch (err) {
    res.send(err);
  }
};

exports.update_question = async (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;

  try {
    const questiondata = await axios.get('http://localhost:3000/api/questions', { params: { id: req.query.id } });
    res.render('update_question', { question: questiondata.data, loggedIn });
  } catch (err) {
    res.send(err);
  }
};

exports.renderOfertaAcademica = async (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;

  try {
    const ofertasAcademicas = await OfertaAcademica.find();
    const estadisticas = await obtenerEstadisticas();
    // Obtener los valores únicos de los campos select desde la base de datos
    const instituciones = await OfertaAcademica.distinct('institucion');
    const carreras = await OfertaAcademica.distinct('carrera');
    const provincias = await OfertaAcademica.distinct('provincia');
    const ciudades = await OfertaAcademica.distinct('ciudad');
    const jornadas = await OfertaAcademica.distinct('jornada');
    const modalidades = await OfertaAcademica.distinct('modalidad');
    const tipos = await OfertaAcademica.distinct('tipo');
    const areas = await OfertaAcademica.distinct('area');


    res.render('oferta-academica', {
      loggedIn,
      ofertasAcademicas,
      mostSearchedUniversity: estadisticas.mostSearchedUniversity,
      mostSearchedCareer: estadisticas.mostSearchedCareer,
      instituciones,
      carreras,
      provincias,
      ciudades,
      jornadas,
      modalidades,
      tipos,
      areas
    });
    
  } catch (err) {
    console.log('Error al obtener las ofertas académicas:', err);
    res.status(500).send('Error al obtener las ofertas académicas');
  }
  
};

exports.home = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('index', { loggedIn });
};

exports.universidades = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('universidades', { loggedIn });
};

exports.add_question = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('add_question', { loggedIn });
};
exports.agregarOfertaAcademica = async (req, res) => {
  try {
    const loggedIn = req.session.isLoggedIn || false;

    // Obtener los valores únicos de los campos select desde la base de datos
    const instituciones = await OfertaAcademica.distinct('institucion');
    const provincias = await OfertaAcademica.distinct('provincia');
    const ciudades = await OfertaAcademica.distinct('ciudad');
    const jornadas = await OfertaAcademica.distinct('jornada');
    const modalidades = await OfertaAcademica.distinct('modalidad');
    const areas = await OfertaAcademica.distinct('area');
    const tipos = await OfertaAcademica.distinct('tipo');

    // Obtener todos los documentos de la colección OfertaAcademica
    const ofertas = await OfertaAcademica.find();
    
    // Crear un objeto que asocie cada institución con su respectivo enlace
    const links = {};
    ofertas.forEach(oferta => {
      links[oferta.institucion] = oferta.link;
    });

    res.render('agregarOfertaAcademica', {
      loggedIn,
      instituciones,
      provincias,
      ciudades,
      jornadas,
      modalidades,
      areas,
      tipos,
      links: JSON.stringify(links)
    });
  } catch (error) {
    console.error(error);
  }
};


exports.contacto = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('contacto', { loggedIn });
};

exports.editUser = (req, res) => {
  res.render('editUser');
};

exports.users = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('users', { loggedIn });
};

exports.dashboard = (req, res) => {
  res.render('dashboard');
};

exports.crearAdmin = (req, res) => {
  res.render('crearAdmin');
};

exports.login = (req, res) => {
  const loggedIn = req.session.isLoggedIn || false;
  res.render('login', { loggedIn });
};

exports.renderCreateForm = async (req, res) => {
  const loggedIn = req.session.isLoggedIn ? true : false;

  try {
    const ofertaAcademicas = await OfertaAcademica.find();
    const results = await Result.find(); // Agregar esta línea para obtener los resultados

    res.render('create-result', {
      ofertaAcademicas: ofertaAcademicas,
      results: results, // Pasar la variable results a la vista
      loggedIn: loggedIn,
      message: null // si desea agregar otro mensaje de error aquí
    });
  } catch (error) {
    console.error('Error al obtener la oferta académica:', error);
    res.status(500).send({
      message: 'Error al obtener la oferta académica.'
    });
  }
};





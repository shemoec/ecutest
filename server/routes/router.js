const express = require('express');
const bodyParser = require('body-parser');
const route = express.Router();
const services = require('../services/render');
const controller = require('../controller/controller');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const Questiondb = require('../model/model');
const upload = multer({ dest: 'uploads/' });
const Location = require('../model/location');
const Perfil = require('../model/perfiles');


// Ruta para obtener todas las provincias
route.get('/provincias', async (req, res) => {
  try {
    const provincias = await Location.distinct('province');
    res.json(provincias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las provincias.' });
  }
});

// Ruta para obtener las ciudades por provincia
route.get('/ciudades/:provincia', async (req, res) => {
  try {
    const provincia = req.params.provincia;
    const ciudades = await Location.find({ province: provincia }).distinct('city');
    res.json(ciudades);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las ciudades.' });
  }
});

route.get('/estadisticas', controller.showStatistics);

//result
route.get('/create-result', services.renderCreateForm);
route.post('/results', controller.createResult);
route.get('/results', controller.listResults);
route.get('/results/:id/edit', controller.editResult);
route.post('/results/:id', controller.updateResult);


//oferta académica
route.post('/oferta-academica/agregar-excel', upload.single('excelFile'), controller.agregarOfertaAcademicaDesdeExcel);
route.get('/oferta-academica/buscar', controller.buscarOfertaAcademica);
route.get('/oferta-academica/estadisticas', controller.obtenerEstadisticas);
route.post('/oferta-academica/agregar', controller.agregarOfertaAcademica);


/**
 *  @description Root Route
 *  @method GET /
 */
route.get('/', services.home);
route.get('/dashboard', authMiddleware.isAuthenticated, services.homeRoutes);
route.get('/universidades', services.universidades);
route.get('/contacto', services.contacto);
route.get('/oferta-academica', services.renderOfertaAcademica);
route.get('/agregarOfertaAcademica', services.agregarOfertaAcademica);

// Rutas para administrador
route.get('/crearAdmin', controller.renderCrearAdmin);
route.post('/crearAdmin', controller.crearAdmin);
route.get('/eliminarAdmin/:id', controller.eliminarAdmin);
route.get('/editarAdmin/:id', controller.renderEditarAdmin);
route.post('/editarAdmin/:id', controller.editarAdmin);

//Rutas Usuario
route.get('/users', controller.showUsers);
route.get('/users/edit/:id', controller.editUserForm);
route.post('/edit-user/:id', controller.editUser);
route.get('/users/delete/:id', controller.deleteUser);


/**
 *  @description funciones de render.js
 *  @method GET /add-question
 */
route.get('/add-question', services.add_question);
route.get('/update-question', services.update_question);
route.get('/users', services.users);
route.get('/login', services.login);

// API QUESTIONS
route.post('/api/questions', controller.createQuestion);
route.get('/api/questions', controller.findQuestion);
route.put('/api/questions/:id', controller.updateQuestion);
route.delete('/api/questions/:id', controller.deleteQuestion);
route.get('/api/ofertas-academicas', controller.buscarOfertaAcademica);

// API TEST
route.use(bodyParser.urlencoded({ extended: true }));
route.get('/test', controller.testPage);
route.post('/submit-test', controller.submitTest);
route.post('/calculate-score', controller.calculateScore);
route.post('/register', controller.createUser);

// Descargar certificado en formato PDF
route.get('/download-pdf', controller.downloadPDF);

// Ruta para procesar el inicio de sesión
route.post('/login', controller.login);

route.post('/logout', (req, res) => {
  // Limpiar la sesión y redirigir al formulario de inicio de sesión
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

route.get('/move-up/:id', controller.moveUp);
route.get('/move-down/:id', controller.moveDown);

route.get('/update-order', async (req, res) => {
  const questions = await Questiondb.find().sort({ _id: 1 });
  for (let i = 0; i < questions.length; i++) {
    await Questiondb.updateOne({ _id: questions[i]._id }, { order: i + 1 });
  }
  res.send('Orden actualizado');
});
route.get('/createProfile', (req, res) => {
  res.render('createProfile.ejs'); // Asegúrate de que la ruta de la vista sea correcta
});

route.post('/createProfile', controller.createProfile);
route.get('/listProfile', controller.listProfiles);
// Ruta para mostrar el formulario de edición de un perfil específico
route.get('/editProfile/:id', controller.showEditProfileForm);

// Ruta para manejar la edición de un perfil
route.post('/editProfile/:id', controller.handleEditProfile);



module.exports = route;

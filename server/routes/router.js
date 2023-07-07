const express = require('express');
const bodyParser = require('body-parser');
const route = express.Router();
const services = require('../services/render');
const controller = require('../controller/controller');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


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





module.exports = route;

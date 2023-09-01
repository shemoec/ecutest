const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const path = require('path');
const session = require('express-session');
const connectDB = require('./server/database/connection');
const app = express();
const User = require('./server/model/user');
const provinciasRoutes = require('./server/routes/router');


// Definir rutas
app.use('/api', provinciasRoutes);

dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 8080

// log requests
app.use(morgan('tiny'));

// mongodb connection
connectDB();

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended : false}))

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))


// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))

// Configurar express-session
app.use(
    session({
      secret: 'my-secret-key',
      resave: false,
      saveUninitialized: false
    })
  );
  
  
// load routers
app.use('/', require('./server/routes/router'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});

app.get('/stats', async (req, res) => {
  const selectedProvince = req.query.province;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  
  const filters = {};
  
  if (selectedProvince) {
    filters.province = selectedProvince;
  }
  
  if (startDate && endDate) {
    filters.fecha = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  try {
    const ageStats = await User.aggregate([
      { $match: filters },
      { $group: { _id: '$age', count: { $sum: 1 } } }
    ]);
    const locationStats = await User.aggregate([
      { $match: filters },
      { $group: { _id: '$location', count: { $sum: 1 } } }
    ]);
    const genderStats = await User.aggregate([
      { $match: filters },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const resultStats = await User.aggregate([
      { $match: filters },
      { $group: { _id: '$resultadotest', count: { $sum: 1 } } }
    ]);

    // Obtener las estadísticas de provincias utilizando una consulta de agregación
    const provinceStats = await User.aggregate([
      { $match: filters },
      { $group: { _id: '$province', count: { $sum: 1 } } }
    ]);
    
    res.json({
      ageStats,
      locationStats,
      genderStats,
      resultStats,
      provinceStats
    });
  } catch (err) {
    console.log('Error al obtener las estadísticas:', err);
    res.status(500).send('Error al obtener las estadísticas');
  }
});

/** 
const areas = [
  "Área de ciencias económicas y empresariales",
  "Área de ciencias exactas y naturales",
  "Área de ciencias sociales, educación y humanidades",
  "Área de ciencias de la salud",
  "Área de ciencias de ingenierías y arquitectura"
];

async function assignRandomAreaToUsers() {
  try {
    // Obtener todos los usuarios
    const users = await User.find();

    // Recorrer cada usuario y asignar un área aleatoria
    for (const user of users) {
      // Seleccionar un índice aleatorio para obtener un área aleatoria
      const randomIndex = Math.floor(Math.random() * areas.length);
      const randomArea = areas[randomIndex];

      // Actualizar el campo resultadotest del usuario con el área aleatoria
      user.resultadotest = randomArea;
      await user.save();

      console.log(`Área aleatoria asignada a ${user.name}: ${randomArea}`);
    }

    console.log('Todas las áreas aleatorias asignadas correctamente.');
  } catch (error) {
    console.error('Error al asignar áreas aleatorias:', error);
  }
}

// Ejecutar el script
assignRandomAreaToUsers();  


const mongoose = require('mongoose');

const Result = require('./server/model/result'); // Asegúrate de usar la ruta correcta al archivo del modelo

async function updateAreas() {
  await Result.updateOne({ _id: '64714d6d5164ae41dc656537' }, { $set: { area: 'Área de ciencias económicas y empresariales' } });
  await Result.updateOne({ _id: '647150405164ae41dc65653c' }, { $set: { area: 'Área de ciencias exactas y naturales' } });
  await Result.updateOne({ _id: '647150a05164ae41dc656541' }, { $set: { area: 'Área de ciencias sociales, educación y humanidades' } });
  await Result.updateOne({ _id: '647151c35164ae41dc656546' }, { $set: { area: 'Área de ciencias de la salud' } });
  await Result.updateOne({ _id: '6471523d5164ae41dc65654b' }, { $set: { area: 'Área de ciencias de ingenierías y arquitectura' } });
}

updateAreas().then(() => {
  console.log('Areas actualizadas');
  mongoose.connection.close();
});


cambiar nombre

async function renameCollection(oldName, newName) {
  // Conéctate a la base de datos usando la función de conexión existente
  await connectDB();

  // Obtén una referencia a la colección antigua
  const oldCollection = mongoose.connection.collection(oldName);

  // Cambia el nombre de la colección
  await oldCollection.rename(newName);

  console.log(`Colección renombrada de ${oldName} a ${newName}`);

  // Cierra la conexión a la base de datos
  mongoose.connection.close();
}

renameCollection('results', 'perfiles');
*/
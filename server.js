const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const path = require('path');
const session = require('express-session');
const connectDB = require('./server/database/connection');
const app = express();
const User = require('./server/model/user');


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


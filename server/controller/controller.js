var Questiondb = require('../model/model');
const bodyParser = require('body-parser');
var User = require('../model/user');
const ejs = require('ejs');
const htmlToPdf = require('html-pdf');
const Admin = require('../model/admin');
const OfertaAcademica = require('../model/ofertaAcademica');
const xlsx = require('xlsx');
const fs = require('fs');
const Result = require('../model/result');



exports.showStatistics = async (req, res) => {
  try {
    // Obtener las estadísticas de los usuarios
    const ageStats = await User.aggregate([
      { $group: { _id: '$age', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const provinceStats = await User.aggregate([
      { $group: { _id:  '$province' , count: { $sum: 1 } } }
    ]);

    const locationStats = await User.aggregate([
      { $group: { _id: { city: '$location' }, count: { $sum: 1 } } }
    ]);

    const genderStats = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Transformar los datos de ubicación para incluir solo el nombre de la ciudad
    const transformedLocationStats = locationStats.map(stat => ({
      _id: stat._id.city,
      count: stat.count
    }));

    // Obtener las estadísticas del resultado del test
    const resultStats = await User.aggregate([
      { $group: { _id: '$resultadotest', count: { $sum: 1 } } }
    ]);

    // Renderizar la vista de estadísticas y pasar los datos de los gráficos como variables
    res.render('estadisticas', {
      loggedIn: req.session.isLoggedIn || false,
      statsData: {
        ageStats: ageStats,
        provinceStats: provinceStats,
        locationStats: transformedLocationStats,
        genderStats: genderStats,
        resultStats: resultStats
      }
    });
  } catch (error) {
    console.log('Error al obtener las estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
};




// Editar resultado
exports.editResult = async (req, res) => {
  const resultId = req.params.id;
  try {
    // Obtener el resultado por ID
    const result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ error: 'No se encontró el resultado' });
    }

    // Obtener los datos de las ofertas académicas desde la base de datos
    const ofertaAcademicas = await OfertaAcademica.find();

    // Renderizar la vista de edición con los datos del resultado y las ofertas académicas
    res.render('edit-result', { result: result, ofertaAcademicas: ofertaAcademicas, loggedIn: req.session.isLoggedIn || false });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


// Actualizar resultado
exports.updateResult = async (req, res) => {
  try {
    const resultId = req.params.id;
    const { descripcion, universidad1, universidad2, universidad3, universidad4 } = req.body;

    // Obtén los datos completos de las universidades seleccionadas
    const universidades = await OfertaAcademica.find({
      _id: { $in: [universidad1, universidad2, universidad3, universidad4] }
    });

    // Actualiza el resultado en la base de datos
    await Result.findByIdAndUpdate(resultId, {
      descripcion,
      universidades: universidades.map(universidad => ({
        institucion: universidad.institucion,
        carrera: universidad.carrera,
        ciudad: universidad.ciudad,
        link: universidad.link
      }))
    });

    res.redirect('/create-result');
  } catch (error) {
    console.error('Error al actualizar el resultado:', error);
    res.status(500).json({ error: 'Error al actualizar el resultado' });
  }
};


// Controlador para crear un resultado
exports.createResult = async (req, res) => {
  try {
    const { descripcion, universidad1, universidad2, universidad3, universidad4 } = req.body;

    // Obtén los datos completos de las universidades seleccionadas
    const universidades = await OfertaAcademica.find({
      _id: { $in: [universidad1, universidad2, universidad3, universidad4] }
    });

    // Crea el nuevo resultado
    const resultado = new Result({
      descripcion,
      universidades: universidades.map(universidad => ({
        institucion: universidad.institucion,
        carrera: universidad.carrera,
        ciudad: universidad.ciudad,
        link: universidad.link
      }))
    });

    // Guarda el resultado en la base de datos
    await resultado.save();

    res.redirect('/create-result');
  } catch (error) {
    console.error('Error al crear el resultado:', error);
    res.status(500).json({ error: 'Error al crear el resultado' });
  }
};

// Controlador para listar los resultados
exports.listResults = async (req, res) => {
  try {
    // Obtén todos los resultados de la base de datos
    const results = await Result.find();

    res.render('results', { results });
  } catch (error) {
    console.error('Error al obtener los resultados:', error);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
};



// Editar usuario
exports.editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, age, email, gender,province, location } = req.body;

    await User.findByIdAndUpdate(userId, { name, age, email, gender, province, location, loggedIn: req.session.isLoggedIn || false  });
    res.redirect('/users');
  } catch(err) {
    console.log('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
};

// Mostrar lista de usuarios
exports.showUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', { users: users, loggedIn: req.session.isLoggedIn || false });
  } catch (err) {
    console.log('Error retrieving users:', err);
    res.status(500).send('Error retrieving users');
  }
};



// Mostrar formulario de edición de usuario
exports.editUserForm = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('editUser', { user, loggedIn: req.session.isLoggedIn || false  });
  } catch(err) {
    console.log('Error retrieving user:', err);
    res.status(500).send('Error retrieving user');
  }
};


// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    await User.findByIdAndDelete(userId);
    res.redirect('/users');
  } catch(err) {
    console.log('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
};

exports.agregarOfertaAcademicaDesdeExcel = (req, res) => {
  const excelFile = req.file;

  const workbook = xlsx.readFile(excelFile.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  jsonData.forEach(data => {
    const { INSTITUCIÓN, CARRERA, PROVINCIA, CIUDAD, JORNADA, MODALIDAD, AREA, TIPO, 'SITIO WEB': link } = data;

    const ofertaAcademica = new OfertaAcademica({
      institucion: INSTITUCIÓN,
      carrera: CARRERA,
      provincia: PROVINCIA,
      ciudad: CIUDAD,
      jornada: JORNADA,
      modalidad: MODALIDAD,
      area: AREA,
      tipo: TIPO,
      link: link
    });

    ofertaAcademica.save()
      .then(result => {
        console.log('Oferta Académica agregada desde Excel:', result);
      })
      .catch(err => {
        console.log('Error al agregar la oferta académica desde Excel:', err);
      });
  });

  fs.unlinkSync(excelFile.path); // Elimina el archivo después de procesarlo

  res.redirect('/oferta-academica');
};

exports.buscarOfertaAcademica = (req, res) => {
  const searchQuery = req.query.search;

  // Realizar la búsqueda en la base de datos por carrera, ciudad o provincia
  OfertaAcademica.find({
    $or: [
      { carrera: { $regex: searchQuery, $options: 'i' } },
      { ciudad: { $regex: searchQuery, $options: 'i' } },
      { provincia: { $regex: searchQuery, $options: 'i' } }
    ]
  })
    .then(results => {
      res.json(results); // Devuelve los resultados como respuesta en formato JSON
    })
    .catch(err => {
      console.log('Error al realizar la búsqueda:', err);
      res.status(500).send('Error al realizar la búsqueda');
    });
};

exports.obtenerEstadisticas = () => {
  return new Promise((resolve, reject) => {
    // Obtén las estadísticas de la base de datos, por ejemplo:
    // Aquí debes implementar la lógica para obtener la universidad más buscada y la carrera más buscada

    const mostSearchedUniversity = 'Universidad XYZ';
    const mostSearchedCareer = 'Licenciatura en Ciencias de la Computación';

    resolve({ mostSearchedUniversity, mostSearchedCareer });
  });
};


exports.agregarOfertaAcademica = (req, res) => {
  const { institucion, carrera, provincia, ciudad, jornada, modalidad, area, tipo, link } = req.body;

  const ofertaAcademica = new OfertaAcademica({
    institucion: institucion,
    carrera: carrera,
    provincia: provincia,
    ciudad: ciudad,
    jornada: jornada,
    modalidad: modalidad,
    area: area,
    tipo: tipo,
    link: link
  });

  ofertaAcademica.save()
    .then(result => {
      console.log('Oferta Académica agregada:', result);
      res.redirect('/agregarOfertaAcademica');
    })
    .catch(err => {
      console.log('Error al agregar la oferta académica:', err);
      res.status(500).send('Error al agregar la oferta académica');
    });
};


exports.editarOfertaAcademica = (req, res) => {
  const { id } = req.params;
  const { institucion, carrera, provincia, ciudad, jornada, modalidad, area, tipo, link } = req.body;

  OfertaAcademica.findByIdAndUpdate(id, {
    institucion: institucion,
    carrera: carrera,
    provincia: provincia,
    ciudad: ciudad,
    jornada: jornada,
    modalidad: modalidad,
    area: area,
    tipo: tipo,
    link: link
  })
    .then(() => {
      console.log('Oferta Académica actualizada');
      res.redirect('/oferta-academica');
    })
    .catch(err => {
      console.log('Error al actualizar la oferta académica:', err);
      res.status(500).send('Error al actualizar la oferta académica');
    });
};

exports.eliminarOfertaAcademica = (req, res) => {
  const { id } = req.params;

  OfertaAcademica.findByIdAndRemove(id)
    .then(() => {
      console.log('Oferta Académica eliminada');
      res.redirect('/oferta-academica');
    })
    .catch(err => {
      console.log('Error al eliminar la oferta académica:', err);
      res.status(500).send('Error al eliminar la oferta académica');
    });
};

// Controlador
exports.renderCrearAdmin = (req, res) => {
  Admin.find({}, (err, usuarios) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.render('crearAdmin', { usuarios: usuarios, loggedIn: req.session.isLoggedIn });
    }
  });
};


// Función para crear un usuario administrador
exports.crearAdmin = (req, res) => {
  const { usuario, contrasena } = req.body;

  // Verificar si ya existe un usuario administrador
  Admin.findOne({ rol: 'admin' })
    .then(adminExistente => {
      if (adminExistente) {
        return res.status(400).send('Ya existe un usuario administrador');
      }

      // Crear el usuario administrador
      const newAdmin = new Admin({
        usuario: usuario,
        contrasena: contrasena,
        rol: 'admin'
      });

      newAdmin.save()
        .then(() => {
          res.redirect('/crearAdmin');
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('Error al crear el usuario administrador');
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error al verificar el usuario administrador');
    });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Verificar las credenciales del usuario
  Admin.findOne({ usuario: username, contrasena: password })
    .then(admin => {
      if (!admin) {
        // Credenciales inválidas, redirigir al formulario de inicio de sesión nuevamente o mostrar un mensaje de error
        res.redirect('/login');
      } else {
        // Credenciales válidas, establecer la sesión del usuario
        req.session.isLoggedIn = true;
        req.session.save(() => {
          // Redirigir al dashboard después de guardar la sesión
          res.redirect('/dashboard');
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error al verificar las credenciales del usuario');
    });
};

// Editar un administrador
exports.editarAdmin = (req, res) => {
  const { id } = req.params;
  const { usuario, contrasena } = req.body;

  Admin.findByIdAndUpdate(id, { usuario, contrasena }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.redirect('/crearAdmin');
    }
  });
};

// Renderizar la vista de edición de administradores
exports.renderEditarAdmin = (req, res) => {
  const { id } = req.params;

  Admin.findById(id, (err, admin) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.render('editarAdmin', { admin, loggedIn: req.session.isLoggedIn });
    }
  });
};


// Eliminar un administrador
exports.eliminarAdmin = (req, res) => {
  const { id } = req.params;

  Admin.findByIdAndDelete(id, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.redirect('/crearAdmin');
    }
  });
};



exports.downloadPDF = async (req, res) => {
  const name = req.query.name;
  const result = req.query.result;

  try {
    // Obtener los datos de universidades desde la base de datos
    const universidades = await Result.find({}, { _id: 0, institucion: 1, carrera: 1, ciudad: 1, link: 1 });

    // Renderizar la vista del certificado
    ejs.renderFile('./views/result.ejs', { name: name, result: result, universidades: universidades }, (err, html) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
      } else {
        // Configurar opciones para la generación de PDF
        const options = {
          format: 'Letter'
        };

        // Generar PDF a partir de HTML
        htmlToPdf.create(html, options).toBuffer((err, buffer) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
          } else {
            // Descargar PDF
            res.set({
              'Content-Disposition': 'attachment; filename="certificado.pdf"',
              'Content-Type': 'application/pdf'
            });
            res.send(buffer);
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
};



// Función para crear un nuevo usuario
exports.createUser = (req, res) => {
  console.log('Request body:', req.body);

  const user = new User({
    name: req.body.name,
    age: req.body.age,
    email: req.body.email,
    gender: req.body.gender,
    province: req.body.province,
    location: req.body.location,
    resultadotest: '' // Agrega el campo resultadotest con un valor inicial vacío
  });

  console.log('User data:', user);

  user.save()
    .then(result => {
      console.log('User saved to database:', result);
      res.redirect(`/test?name=${req.body.name}`);
    })
    .catch(err => {
      console.log('Error saving user to database:', err);
      res.status(500).send('Error registering user in the database');
    });
};


// create and save new question
exports.createQuestion = (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be emtpy!" });
        return;
    }

    // new question
    const question = new Questiondb({
        question: req.body.question,
        answers: [
            req.body.answer1,
            req.body.answer2,
            req.body.answer3,
            req.body.answer4,
            req.body.answer5
        ]
    })

    // save question in the database
    question.save(question)
        .then(data => {
            res.redirect('/dashboard');
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a create operation"
            });
        });
}

// retrieve and return all questions / retrieve and return a single question
exports.findQuestion = (req, res) => {
    if (req.query.id) {
        const id = req.query.id;

        Questiondb.findById(id)
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: "Not found question with id " + id })
                } else {
                    res.send(data)
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Error retrieving question with id " + id })
            })

    } else {
        Questiondb.find()
            .then(questions => {
                res.send(questions)
            })
            .catch(err => {
                res.status(500).send({ message: err.message || "Error Occurred while retrieving question information" })
            })
    }
}

exports.updateQuestion = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  const id = req.params.id;
  const updatedQuestion = {
    question: req.body.question,
    answers: []
  };

  // Iterar a través de los campos de respuesta
  for (let i = 0; i < 5; i++) {
    const answer = req.body[`answers[${i}]`];
    if (answer !== undefined) {
      updatedQuestion.answers.push(answer);
    } else {
      updatedQuestion.answers.push("");
    }
  }
  

  console.log('req.body:', req.body);
  console.log('updatedQuestion:', updatedQuestion);

  Questiondb.findByIdAndUpdate(id, updatedQuestion, { useFindAndModify: false, new: true })
    .then(data => {
      if (!data) {
        console.log(`Cannot Update question with ${id}. Maybe question not found!`);
        res.status(404).send({ message: `Cannot Update question with ${id}. Maybe question not found!` });
      } else {
        console.log(`Updated question: ${data}`);
        res.send(data);
      }
    })
    .catch(err => {
      console.log(`Error updating question: ${err}`);
      res.status(500).send({ message: "Error Update question information" });
    });
};

// Delete a question with specified question id in the request
exports.deleteQuestion = (req, res) => {
    const id = req.params.id;

    Questiondb.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot Delete question with id ${id}. Maybe id is wrong` })
            } else {
                res.send({
                    message: "Question was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Question with id=" + id
            });
        });
}


exports.calculateScore = (req, res) => {
  const answers = [];
  for (let i = 0; i < req.body.questions.length; i++) {
    answers.push(req.body[`answer${i}`]);
  }

  let score = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] !== undefined && answers[i] !== null) {
      score += parseInt(answers[i]);
    }
  }

  res.render('result', { score });
}

exports.submitTest = async (req, res) => {


  console.log(req.body);

  const answers = Object.values(req.body).filter(value => value !== undefined && value !== '');
  let count0 = 0;
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;
  let count4 = 0;

  if (answers.length > 0) {
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      console.log(`Respuesta seleccionada para la pregunta ${i}: ${answer}`);

      if (answer === '0') {
        count0++;
      } else if (answer === '1') {
        count1++;
      } else if (answer === '2') {
        count2++;
      } else if (answer === '3') {
        count3++;
      } else if (answer === '4') {
        count4++;
      }
    }
  } else {
    console.log('No se encontraron respuestas en el formulario.');
    res.render('error', { message: 'Debe seleccionar al menos una respuesta.' });
    return;
  }

  console.log(`Count of 0: ${count0}`);
  console.log(`Count of 1: ${count1}`);
  console.log(`Count of 2: ${count2}`);
  console.log(`Count of 3: ${count3}`);
  console.log(`Count of 4: ${count4}`);

  let maxCount = Math.max(count0, count1, count2, count3, count4);
  
let universidadesArea= [];

const name = req.query.name;
// Obtener la provincia del usuario a partir de su nombre
const user = await User.findOne({ name: name });

// Imprimir el valor de user.province en la consola
console.log(`Provincia del usuario: ${user.province}`);

// Define an array of objects to store the results for each area
let areas = [
  { area: "Área de ciencias económicas y empresariales", count: count0, universities: [] },
  { area: "Área de ciencias exactas y naturales", count: count1, universities: [] },
  { area: "Área de ciencias sociales, educación y humanidades", count: count2, universities: [] },
  { area: "Área de ciencias de la salud", count: count3, universities: [] },
  { area: "Área de ciencias de ingenierías y arquitectura", count: count4, universities: [] }
];

// Retrieve universities for each area
for (let i = 0; i < areas.length; i++) {
  let area = areas[i];
  area.universities = await OfertaAcademica.aggregate([
    { $match: { area: area.area, provincia: user.province } },
    { $sample: { size:5 } }
  ]);
}

// Imprimir el valor de areas en la consola
console.log(`Valor de areas: ${JSON.stringify(areas, null, 2)}`);

// Sort the areas array based on the count property, in descending order
areas.sort((a, b) => b.count - a.count);


// Sort the areas array based on the count property, in descending order
areas.sort((a, b) => b.count - a.count);

// Define a variable to store the result description
let result = '';

if (maxCount === count0) {
  const resultData = await Result.findById('64714d6d5164ae41dc656537');
  if (resultData) {
    result = resultData.descripcion;
  }
} else if (maxCount === count1) {
  const resultData = await Result.findById('647150405164ae41dc65653c');
  if (resultData) {
    result = resultData.descripcion;
  }
} else if (maxCount === count2) {
  const resultData = await Result.findById('647150a05164ae41dc656541');
  if (resultData) {
    result = resultData.descripcion;
  }
} else if (maxCount === count3) {
  const resultData = await Result.findById('647151c35164ae41dc656546');
  if (resultData) {
    result = resultData.descripcion;
  }
} else if (maxCount === count4) {
  const resultData = await Result.findById('6471523d5164ae41dc65654b');
  if (resultData) {
    result = resultData.descripcion;
  }
}

// Pass the sorted areas array and the result description to the view
res.render('result', { result: result, areas: areas, name: name });
}









  exports.testPage = (req, res) => {
    // retrieve all questions from the database
    Questiondb.find()
      .then(questions => {
        const name = req.query.name; // Obtener el nombre desde la URL
        console.log(`Nombrefunciontest: ${name}`);
  
        res.render('test', { questions, name: req.query.name, loggedIn: req.session.loggedIn });
        // Asegúrate de incluir loggedIn en el objeto pasado al renderizar la vista
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Error Occurred while retrieving question information"
        });
      });
  }
  
  
// authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
  // Verificar si el usuario ha iniciado sesión
  if (req.session.isLoggedIn) {
    // El usuario ha iniciado sesión, continuar con la siguiente función de middleware
    next();
  } else {
    // El usuario no ha iniciado sesión, redirigir al formulario de inicio de sesión o mostrar un mensaje de error
    res.redirect('/login');
  }
};

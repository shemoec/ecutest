
PASO1: npm install
```
```
PASO2: npm start
```


Aplicación: Plataforma de Test Vocacional

Descripción:
La plataforma de Test Vocacional es una aplicación web que ayuda a los usuarios a descubrir sus aptitudes y preferencias vocacionales, con el objetivo de orientarlos en la elección de una carrera universitaria. La aplicación recopila información sobre los usuarios, como su nombre, edad, género, ubicación y resultados del test vocacional. Luego, utiliza esta información para generar estadísticas y gráficos que brinden una visión general de las preferencias vocacionales de los usuarios. El aplicativo tiene varios modulos para facilitar la administracion el el modulo Dashboard podemos manejar todo el sitio editar, crear y eliminar los campos mas relevantes de la aplicacion utilizamos nivel de usuario Administrador para la administracion del sitio lo que garantiza la usabilidad de la aplicacion.

Estructura de la aplicación:

1. Frontend (React.js):
   - El frontend de la aplicación está construido utilizando React.js, una biblioteca de JavaScript para construir interfaces de usuario interactivas.
   - Se utilizan componentes reutilizables y un enfoque basado en el estado para crear una interfaz de usuario dinámica y receptiva.
   - Se utilizan bibliotecas como Axios para realizar solicitudes HTTP al backend y visualizar los datos recibidos.

2. Backend (Node.js, Express.js):
   - El backend de la aplicación está desarrollado utilizando Node.js y Express.js.
   - Node.js proporciona un entorno de tiempo de ejecución de JavaScript en el lado del servidor, lo que permite construir aplicaciones web escalables y de alto rendimiento.
   - Express.js es un framework de aplicación web que simplifica el manejo de solicitudes y respuestas HTTP, el enrutamiento y la gestión de middleware.
   - Se utilizan diferentes módulos de Express.js, como "body-parser" para analizar los datos enviados en las solicitudes y "express-session" para gestionar las sesiones de usuario.

3. Base de datos (MongoDB, Mongoose):
   - La aplicación utiliza MongoDB, una base de datos NoSQL, para almacenar los datos de los usuarios y los resultados del test vocacional.
   - Mongoose es una biblioteca de modelado de objetos para MongoDB en Node.js, que proporciona una interfaz sencilla y basada en esquemas para interactuar con la base de datos.
   - Se definen esquemas de datos utilizando Mongoose para asegurar la consistencia y la validación de los datos.

4. Otros módulos y bibliotecas:
   - Se utilizan diversas bibliotecas y módulos adicionales para mejorar la funcionalidad de la aplicación, como "ejs" para la generación de vistas dinámicas, "multer" para el manejo de archivos multimedia, "axios" para realizar solicitudes HTTP desde el frontend, entre otros.
   - También se utilizan bibliotecas como "canvas" y "xlsx" para generar gráficos y exportar datos en diferentes formatos.

En resumen, la aplicación de Test Vocacional sigue una arquitectura basada en el stack MERN. React.js se utiliza en el frontend para construir una interfaz de usuario dinámica, Node.js y Express.js en el backend para manejar las solicitudes y respuestas HTTP, MongoDB como base de datos para almacenar los datos de los usuarios, y Mongoose para facilitar la interacción con la base de datos. Además, se utilizan varios módulos y bibliotecas adicionales para mejorar la funcionalidad de la aplicación. En conjunto, estas tecnologías y módulos permiten desarrollar una plataforma de Test Vocacional eficiente, escalable y fácil de mantener.

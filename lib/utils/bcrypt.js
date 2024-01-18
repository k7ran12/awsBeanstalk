// bcryptUtils.js
const bcrypt = require('bcrypt');

// Función para hashear una contraseña
async function hashPassword(password) {
  const saltRounds = 10; // Número de rondas de sal (mayor es más seguro pero más lento)
  return await bcrypt.hash(password, saltRounds);
}

// Función para comparar una contraseña ingresada con la almacenada en la base de datos
async function comparePasswords(enteredPassword, storedPassword) {
  return await bcrypt.compare(enteredPassword, storedPassword);
}

// Exportar las funciones
module.exports = { hashPassword, comparePasswords };
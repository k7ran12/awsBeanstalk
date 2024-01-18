const express = require("express");
const router = express.Router();
var validator = require("validator");
// Ruta específica para usuarios
const createConexion = require("../lib/mysql/conexion");
const { hashPassword } = require("../lib/utils/bcrypt");

router.post("/create", async (req, res) => {
  const datos = req.body;
  const { nombre, edad, correo, pass } = datos;

  // Validar que los campos requeridos existan
  if (!nombre || !edad || !correo || !pass) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Validar el formato del correo electrónico
  if (!validator.isEmail(correo)) {
    return res
      .status(400)
      .json({ error: "El correo electrónico no es válido" });
  }

  // Validar la longitud de la contraseña
  if (!validator.isLength(pass, { min: 6 })) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    // Obtener una conexión a la base de datos
    const connection = await createConexion();
    const sql =
      "INSERT INTO usuarios (nombre, edad, correo, pass) VALUES (?, ?, ?, ?)";
    //Encriptar contraseña
    const password = await hashPassword(pass);
    const values = [nombre, edad, correo, password];

    const [result, fields] = await connection.execute(sql, values);

    console.log(result);
    console.log(fields);

    // Cerrar la conexión después de usarla
    await connection.end();

    // Verificar el número de filas afectadas
    if (result.affectedRows > 0) {
      res.json({ mensaje: "Usuario creado exitosamente" });
    } else {
      res.status(500).json({ error: "No se pudo crear el usuario" });
    }
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/show", async (req, res) => {
  try {
    const connection = await createConexion();
    const [result, fields] = await connection.query("SELECT * FROM usuarios");
    console.log(result);
    res.json({ result });
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/show/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const connection = await createConexion();
    const sql = "SELECT * FROM usuarios WHERE id = ?";
    const values = [id];
    const [rows, fields] = await connection.query(sql, values);
    // Cerrar la conexión después de usarla
    await connection.end();
    if (rows.length > 0) {
      // Si hay al menos un registro, enviar el primer elemento del array (el único registro)
      res.json(rows[0]);
    } else {
      // Si no hay registros, enviar un objeto vacío o un mensaje de no encontrado
      res.status(404).json({ mensaje: "No se encontró el registro" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const connection = await createConexion();

    // Verificar si el registro existe antes de intentar eliminarlo
    const [checkRow] = await connection.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );

    if (checkRow.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró el registro a eliminar" });
    }

    // Ejecutar la consulta de eliminación
    await connection.query("DELETE FROM usuarios WHERE id = ?", [id]);

    // Cerrar la conexión después de usarla
    await connection.end();

    res.json({ mensaje: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, edad, correo, pass } = req.body;

    // Verificar si el registro que se va a actualizar existe antes de intentar actualizarlo
    const connection = await createConexion();
    const [checkRow] = await connection.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );

    if (checkRow.length === 0) {
      await connection.end();
      return res
        .status(404)
        .json({ mensaje: "No se encontró el registro a actualizar" });
    }

    // Ejecutar la consulta de actualización
    await connection.query(
      "UPDATE usuarios SET nombre = ?, edad = ?, correo = ?, pass = ? WHERE id = ?",
      [nombre, edad, correo, pass, id]
    );

    // Cerrar la conexión después de usarla
    await connection.end();

    res.json({ mensaje: "Registro actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

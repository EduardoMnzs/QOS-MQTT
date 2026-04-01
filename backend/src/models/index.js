const sequelize  = require("../config/database");
const Leitura    = require("./Leitura");
const Publicacao = require("./Publicacao");

module.exports = { sequelize, Leitura, Publicacao };
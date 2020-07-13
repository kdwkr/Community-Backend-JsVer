const { Model, DataTypes } = require('sequelize');
const { BoardTypes } = require('../types/board');
const { Article } = require('./article');

class Board extends Model {}

module.exports.Board = Board;

module.exports.BoardInit = sequelize => {
  Board.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(20),
        allowNull: false,
      },
      desc: {
        type: new DataTypes.STRING(200),
        allowNull: false,
      },
      type: {
        type: new DataTypes.ENUM(...BoardTypes),
        allowNull: false,
      },
    },
    {
      tableName: 'boards',
      sequelize,
    },
  );
  Board.hasMany(Article, {
    sourceKey: 'id',
    foreignKey: 'boardId',
    as: 'articles',
  });
};

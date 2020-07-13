const { Model, DataTypes } = require('sequelize');

const { Article } = require('./article');
const { Comment } = require('./comment');

class User extends Model {}
module.exports.User = User;

module.exports.UserInit = sequelize => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: new DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false,
      },
      password: {
        type: new DataTypes.CHAR(128),
        allowNull: true,
      },
      nickname: { type: new DataTypes.STRING(15), allowNull: false },
    },
    {
      tableName: 'users',
      sequelize,
    },
  );
  User.hasMany(Article, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'articles',
  });
  Article.belongsTo(User, {
    foreignKey: 'userId',
    as: 'writer',
  });
  User.hasMany(Comment, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'comments',
  });
  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'writer',
  });
};

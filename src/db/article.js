const { Model, DataTypes } = require('sequelize');
const { Comment } = require('./comment');

class Article extends Model {}

module.exports.Article = Article;

module.exports.ArticleInit = sequelize => {
  Article.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      boardId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      title: {
        type: new DataTypes.STRING(20),
        allowNull: false,
      },
      content: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
      },
    },
    {
      tableName: 'articles',
      sequelize,
    },
  );
  Article.hasMany(Comment, {
    sourceKey: 'id',
    foreignKey: 'articleId',
    as: 'comments',
  });
};

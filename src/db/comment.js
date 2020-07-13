const { Model, DataTypes } = require('sequelize');

class Comment extends Model {}

module.exports.Comment = Comment;

module.exports.CommentInit = sequelize => {
  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      articleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      parentCommentId: {
        type: DataTypes.INTEGER.UNSIGNED,
      },
      content: {
        type: new DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      tableName: 'comments',
      sequelize,
    },
  );
  Comment.hasMany(Comment, {
    sourceKey: 'id',
    foreignKey: 'parentCommentId',
    as: 'childComments',
  });
  Comment.belongsTo(Comment, {
    foreignKey: 'parentCommentId',
    as: 'parentComment',
  });
};

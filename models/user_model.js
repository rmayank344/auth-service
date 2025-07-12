const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_config");

const USERMODEL = sequelize.define('user_model',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phone: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    timestamps: true, // This will add automatically created_at and updated_at
    freezeTableName: true,
    tableName: "user_model",
  }
);

// sequelize.sync({ force: true }) // Uncomment this if you want to sync the model with the database
//   .then(() => {
//     console.log('Database & tables created!');
// });

module.exports = USERMODEL
//models/user.js
const express = require('express');
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require('sequelize');
const { title } = require('process');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT
});

const User = sequelize.define('User', {
  idx: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  userid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false, 
  },
  userpw: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type : DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type : DataTypes.STRING,
    allowNull: false
  },
  connect: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  }
})
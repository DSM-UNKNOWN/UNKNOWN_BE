//models/feed.js
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

const Feed = sequelize.define('Feed', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false, 
  },
  hospitalSelect: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hospitalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hospitalMonth: {
    type : DataTypes.STRING,
    allowNull: false
  },
  hospitalBlood: {
    type : DataTypes.STRING,
    allowNull: false
  },
  hospitalInjury: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hospitalDisease: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hospitalSurgery: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false, 
  }
})
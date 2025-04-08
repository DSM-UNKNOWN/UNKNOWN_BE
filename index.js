const express = require('express');
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT
});

const User = sequelize.define('User', {
  idx: { // 고유번호
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userid: { // 아이디
    type: DataTypes.STRING,
    unique: true,
    index: true,  // 인덱스 추가
  },
  userpw: { // 비밀번호
    type: DataTypes.STRING
  },
  name: { // 이름
    type: DataTypes.STRING
  },
  state: { // 병원 or 구급대원
    type: DataTypes.STRING
  },
  phone: { // 전화번호
    type: DataTypes.STRING,
    index: true, // 인덱스 추가
  },
  connect: { // 소속
    type: DataTypes.STRING
  },
  token: { // 토큰
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

const Feed = sequelize.define('Feed', {
  id: { // 고유번호
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phone: { // 구급대원 전화번호
    type: DataTypes.STRING,
    index: true, // 인덱스 추가
  },
  hospitalSelect: { // 선택한 병원 이름
    type: DataTypes.STRING,
    index: true, // 인덱스 추가
  },
  hospitalName: { // 환자 이름
    type: DataTypes.STRING,
  },
  hospitalMonth: { // 환자 나이
    type: DataTypes.STRING,
  },
  hospitalBlood: { // 환자 혈액형
    type: DataTypes.STRING,
  },
  hospitalInjury: { // 환자 부상 부위
    type: DataTypes.STRING,
  },
  hospitalDisease: { // 질병 여부
    type: DataTypes.STRING,
  },
  hospitalSurgery: { // 수술 여부
    type: DataTypes.STRING,
  },
  state: { // 병원 측 승인 여부 (승인: confm, 대기: wait)
    type: DataTypes.STRING,
  }
}, {
  timestamps: false
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.post('/user/signup', async (req, res) => {
  const { userid, userpw, name, state, phone, connect } = req.body;

  try {
    const thisUser = await User.findOne({ where: { userid } });

    if (thisUser) {
      return res.status(409).json({ message: "중복된 아이디입니다." });
    }

    const hashedPassword = await bcrypt.hash(userpw, 10);

    await User.create({ 
      userid,
      userpw: hashedPassword,
      name,
      state,
      phone,
      connect
    });

    return res.status(201).json("회원가입에 성공했습니다.");
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

app.post('/user/login', async (req, res) => {
  const { userid, userpw } = req.body;

  try {
    const thisUser = await User.findOne({ where: { userid } });

    if (!thisUser) {
      return res.status(404).json({ message: "존재하지 않는 아이디입니다." });
    }

    const isPasswordValid = await bcrypt.compare(userpw, thisUser.userpw);

    if (!isPasswordValid) {
      return res.status(409).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const accessToken = jwt.sign(
      { 
        userid: thisUser.userid,
      }, 
      process.env.SECRET, 
      {
        expiresIn: "1h",
      }
    );

    await thisUser.update({
      token: accessToken,
    });

    res.status(201).json({ accessToken });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

app.get('/user/info', async (req, res) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader) {
      return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userid = decodedToken.userid;

    const thisUser = await User.findOne({ 
      where: { userid },
      attributes: { exclude: ["userpw", "token"] },
    });

    if (!thisUser) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    res.status(200).json({ 
      userid: thisUser.userid,
      name: thisUser.name,
      phone: thisUser.phone,
      connect: thisUser.connect
    });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

app.get('/feed', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { page = 1, limit = 10 } = req.query;
  
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userid = decodedToken.userid;

    const thisUser = await User.findOne({ where: { userid } });

    if (!thisUser) {
      return res.status(404).json({ message: "요청한 페이지를 찾을 수 없습니다." });
    }

    const hospitalSelect = thisUser.connect;

    const data = await Feed.findAll({
      where: { hospitalSelect },
      offset: (page - 1) * limit,
      limit: limit,
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

app.patch('/feed', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { id, state } = req.body;

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userid = decodedToken.userid;

    const thisUser = await User.findOne({ where: { userid } });

    if (!thisUser) {
      return res.status(404).json({ message: "요청한 페이지를 찾을 수 없습니다." });
    }

    const thisFeed = await Feed.findOne({ where: { id } });

    await thisFeed.update({
      state,
    });

    return res.status(204).json({ message: "요청에 성공했습니다." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

app.post('/feed/post', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { phone, hospitalSelect, hospitalName, hospitalMonth, hospitalBlood, hospitalInjury, hospitalDisease, hospitalSurgery } = req.body;

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userid = decodedToken.userid;

    const thisUser = await User.findOne({ where: { userid } });

    if (!thisUser) {
      return res.status(404).json({ message: "요청한 페이지를 찾을 수 없습니다." });
    }

    await Feed.create({ 
      phone,
      hospitalSelect,
      hospitalName,
      hospitalMonth,
      hospitalBlood,
      hospitalInjury,
      hospitalDisease,
      hospitalSurgery,
      state: 'wait',
    });

    return res.status(201).json({ message: "요청에 성공했습니다." });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "요청에 실패했습니다." });
  }
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

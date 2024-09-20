//controllers/feedController.js
const bcrypt = require("bcrypt");
const { User, Feed } = require('../models');
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getFeedlist = async (req, res) => {
    const userid = req.decoded.id;
    const { keyword } = req.qurey;
  
    try {
        const thisUser = await User.findOne({
            where: { userid },
        });

        if(!thisUser) {
            return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
        }

        const postList = await post.findAll({
            [Op.or]: [
            { hospitalSelect: { [Op.like]: `%${keyword}%` } },
            ],
        });
  
        return res.status(200).json({ message: "요청에 성공했습니다.", postList });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "요청에 실패했습니다." });
    }
};

const updateState = async (req, res) => {
    const userid = req.decoded.id;
    const { id, state } = req.body;

    try {
        const thisUser = await User.findOne({
            where: { userid },
        });

        if(!thisUser) {
            return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
        }

        const thisPost = await Feed.findOne({
            where: { id },
        })

        await thisPost.update({
            state: state,
        })

        return res.status(200).json({ message: "업데이트에 성공했습니다." });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "요청에 실패했습니다." })
    }
}

const postFeed = async (req, res) => {
    const userid = req.decoded.id;
    const { hospitalSelect,  hospitalName, hospitalMonth, hospitalBlood, hospitalInjury, hospitalDisease, hospitalSurgery } = req.body;

    try {
        const thisUser = await User.findOne({
            where: { userid },
        });

        if(!thisUser) {
            return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
        }

        await Feed.create({
            phone: thisUser.phone,
            hospitalSelect,
            hospitalName,
            hospitalMonth,
            hospitalBlood,
            hospitalInjury,
            hospitalDisease,
            hospitalSurgery,
            state: "wait",
        });

        return res.status(201).json({ message: "환자 등록에 성공했습니다." });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: "요청에 실패했습니다." });
    }
}

module.exports = {
    getFeedlist,
    updateState,
    postFeed,
};
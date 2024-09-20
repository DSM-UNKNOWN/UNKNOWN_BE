//controllers/userController.js
const bcrypt = require("bcrypt");
const { User } = require('../models');
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signup = async(req, res) => {
    const { userid, userpw, name, state, phone, connect } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(userpw, 10);

        const existUser = await User.findOne({
            where: { userid }
        });

        if(existUser) {
            return res.status(409).json({ message: "중복된 아이디입니다."});
        }

        await User.create({
            userid,
            userpw: hashedPassword,
            nickname,
            pet_name,
            species,
            pet_birth,
            region,
        });

        return res.status(201).json({ message: "회원가입에 성공했습니다." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message : "요청에 실패했습니다." });
    }
}

const login = async(req, res) => {
    const { userid, userpw } = req.body;

    try {
        const thisUser = await User.findOne({
            where: { userid },
        })

        if(!thisUser) {
            return res.status(404).json({ message: "존재하지 않는 아이디입니다." });
        }

        const isPassword = await bcrypt.compare(userpw, thisUser.userpw);

        if(isPassword) {
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

        return res.status(201).json({ message: "로그인에 성공했습니다.", accessToken });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "요청에 실패했습니다." });
    }
}

const logout = async(req, res) => {
    const { userid } = req.decoded;
    
    try {
        if(!userid) {
            return res.status(404).json({ message: "로그인이 필요합니다." });
        }

        const thisUser = await User.findOne({ where: { userid } });

        await thisUser.update({ token: null });

        return res.status(204).json({ message: "서버에서 정상적인 변경 또는 삭제 처리가 이루어졌지만, 새롭게 보일 정보가 없습니다." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "요청에 실패했습니다." });
    }
};

const getUser = async (req, res) => {
    const { userid } = req.decoded;

    try {
        const thisUser = await User.findOne({
            where: { userid },
            attributes: { exclude: ["userpw", "token"] }
        });

        if(!thisUser) {
            return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
        }

        return res.status(200).json({
            userid: thisUser.userid,
            nickname: thisUser.nickname,
            pet_name: thisUser.pet_name,
            species: thisUser.species,
            pet_birth: thisUser.pet_birth,
            region: thisUser.region,
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "요청에 실패했습니다." });
    }
};

const updateUser = async (req, res) => {
    const userid = req.decoded.id;
    const { name, phone, connect } = req.body;

    try {
        const thisUser = await User.findOne({
            where: { userid },
        })

        if (!thisUser) {
            return res.status(404).json({ message : "존재하지 않는 계정입니다." })
        }

        await thisUser.update({
            name : name,
            phone : phone,
            connect : connect,
        })

        return res.status(200).json({ message: "업데이트에 성공했습니다." });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message : "요청에 실패했습니다." })
    }
}

const deleteUser = async (req, res) => {
    const { userid } = req.decoded;

    try {
        const thisUser = await userid.findOne({ where: { userid }});

        if(!thisUser) {
            return res.status(404).json({ message: "존재하지 않는 유저"});
        }

        await userid.destroy({
            where: { userid: thisUser.userid },
        });

        return res.status(200).json({ message: "회원 탈퇴에 성공했습니다"});
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: "요청에 실패했습니다"});
    }
}

module.exports = {
    signup,
    login,
    logout,
    getUser,
    updateUser,
    deleteUser,
  };
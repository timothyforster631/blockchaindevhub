// 引入所需库
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const cors = require('cors');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // 假设你有一个用户模型
const contractABI = require('./contractABI.json');
const contractAddress = '0x...'; // 智能合约地址

// 初始化 Express 应用
const app = express();
const port = process.env.PORT || 3000;

// 连接到 MongoDB 数据库
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// 应用中间件
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// 初始化 Web3
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// 智能合约实例
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 路由和控制器
// 用户注册
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send('Error registering new user');
    }
});

// 用户登录
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.cookie('token', token, { httpOnly: true });
            res.status(200).send('User logged in');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in user');
    }
});

// 获取智能合约数据
app.get('/contract-data', async (req, res) => {
    try {
        const data = await contract.methods.someMethod().call(); // 假设 yourContract 有一个方法叫做 someMethod
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching contract data');
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


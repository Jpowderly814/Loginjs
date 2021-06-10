const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    session({
        key: "userId",
        secret: "subscribe", //?
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
        },
    })
);
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "loginSystem",
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {

        if (err) {
            console.log(err);
        }

        db.query(
            "INSERT INTO users (username, password) VALUES (?,?)", 
            [username, hash], 
            (err, result) => {
                console.log(err);
            }
        );
    });  
});


const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if(!token) {
        res.send("Need a token");
    }else{
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if (err) {
                res.json({auth: false, message: "Failed to authenticate"});
            }else{
                req.userId = decoded.id;
                next();
            }
        });
    }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
    console.log(res);
    res.send("You are authenticated");
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user});
    }else{
        res.send({loggedIn: false});
    }
});

app.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE username = ?;", 
        username, 
        (err, result) => {
            if (err){
                res.send({err: err});
            }
        
            if(result.length > 0) { 
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if(response) {
                        req.session.user = result; //sets session

                        const id = result[0].id;
                        const token = jwt.sign({id}, "jwtSecret", {  
                            expiresIn: 300,
                        });
                        res.json({auth: true, token: token, result: result}); //creates token, sends back user that is logged in
                    }else{
                        res.json({auth: false, message: "Wrong username/password combination"});
                    }
                });
            }else{
                res.json({auth: false, message: "no user exists"});
            }
        }
    );
});
app.listen(3001, ()=> {
    console.log("Yay,your server is running on port 3001!");
});
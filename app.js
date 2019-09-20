const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const router = express.Router()
const config = require('./config')
const tokenList = {}
const app = express();
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/login', (req,res) => {

    console.log("Inside")
    const postData = req.body;
    console.log("postData===" +postData)
    const user = {
        "uname": postData.uname,
        "psw": postData.psw
    }
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
    const response = {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    }
    tokenList[refreshToken] = response
    res.status(200).json(response);

})

app.post('/token', (req,res) => {
    const postData = req.body
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "uname": postData.uname,
            "psw": postData.psw
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
})

//app.use(require('./tokenChecker'))




app.use(bodyParser.json())

app.listen(8080);
console.log("Server started listening to port 8080")

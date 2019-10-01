var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

// var WebSocket = require('ws');

// const socketServer = new WebSocket.Server({ port: 3050 });

// socketServer.on('connection', ws => {
//     ws.send('Welcome to Dmi3z websocket');
// });

var app = express();
var db;


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ------

app.get('/tasks', (req, res) => {
    const userId = req.query.token;

});

app.post('/auth', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.collection('users').findOne({email, password}, (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (result) {
            res.send(result._id);
        } else {
            res.sendStatus(404);
        }
        
    });
});

// ------


const port = process.env.PORT || 3000;

MongoClient.connect('mongodb+srv://dmi3z:xbvbb7c9@cluster0-unbvo.mongodb.net/test?retryWrites=true&w=majority', (err, database) => {
    if (err) {
        return console.log(err);
    }
    db = database.db('tasklist');
    app.listen(port);
    console.log('API app started! Port: ', port);
})

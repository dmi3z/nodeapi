var express = require('express');
var bodyParser = require('body-parser');
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
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ------

app.get('/tasks', (req, res) => {
    const userId = req.query.token;
    db.collection('tasks').find({ userId }).toArray((err, data) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.send(data);
    });
});

app.post('/tasks', (req, res) => {
    const task = req.body;
    const userId = req.query.token;
    task.userId = userId;
    db.collection('tasks').insertOne(task, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.send(JSON.stringify(task));
    })
});

app.delete('/tasks', (req, res) => {
    const taskId = req.query.id;
    const userId = req.query.token;
    db.collection('tasks').deleteOne({_id: taskId, userId }, (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.send(result);
    });
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

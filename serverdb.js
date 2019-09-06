var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var users = [
    {
        id: 0,
        name: 'Andrew'
    },
    {
        id: 1,
        name: 'Anton'
    },
    {
        id: 2,
        name: 'Dmitry'
    }
];

app.get('/', function(req, res) {
    res.send('Hello API');
});

app.get('/users', function(req, res) {
    res.send(users);
});

app.get('/users/:id', function(req, res) {
    const user = users.find(user => user.id === +req.params.id);
    res.send(user);
});

app.post('/users', function(req, res) {
    var user = {
        id: Date.now(),
        name: req.params.name
    }
    users.push(user);
    res.sendStatus(200);
});


MongoClient.connect('mongodb://localhost:27017/myapi', function(err, database) {
    if (err) {
        return console.log(err);
    }
    db = database;
    app.listen('3012', function() {
        console.log('API app started!');
    });
})

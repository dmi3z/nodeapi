var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var users = [];

app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    getUser(id).then(data => {
        res.send(data);
    }).catch(_ => {
        res.sendStatus(500);
    });
});

app.post('/users', (req, res) => {
    addUser(req.body.name).then(_ => res.sendStatus(200)).catch(_ => sendStatus(500));
});

app.post('/auth', (req, res) => {
    const user = users.find(u => u.email === req.body.email);
    if (user && req.body.password === user.password) {
        res.send(user.id.toString());
    } else {
        res.sendStatus(500);
    }
});

app.delete('/user', (req, res) => {
    deleteUser(req.body.id).then(_ => res.sendStatus(200)).catch(_ => sendStatus(500));
});

function getUsers() {
    return new Promise((resolve, reject) => {
        fs.readFile('users.json', 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function getUser(id) {
    return new Promise((resolve, reject) => {
        const user = users.find(u => +u.id === +id);
            if (user) {
                resolve(user);
            }            
            reject();
    }).catch(_ => reject());
}

function addUser(name) {
    return new Promise((resolve, reject) => {

            var maxId = 0;
            users.forEach(user => {
                if (+user.id > maxId) {
                    maxId = +user.id;
                }
            });
            users.push({
                id: maxId + 1,
                name: name
            });
            saveChanges().then(_ => resolve()).catch(_ => reject());
        }); 
}

function deleteUser(id) {
    return new Promise((resolve, reject) => {
        getUser(id).then(res => {
            if (res) {
                const index = users.indexOf(res);
                users.splice(index, 1);
                saveChanges().then(_ => resolve()).catch(_ => reject());
            } else {
                reject();
            }
        }).catch(_ => reject());
    });
}

function saveChanges() {
    return new Promise((res, rej) => {
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) {
                rej();
            }
            res();
        });
    });
}

//heroku

const port = process.env.PORT || 3000;

getUsers().then(data => {
    users = JSON.parse(data);
    app.listen(port);
    console.log('API app started! Port: ', port);
}).catch(_ => {
    console.log('No Database');
});


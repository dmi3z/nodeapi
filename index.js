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

var users = [];

/* app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    getUser(id).then(data => {
        res.send(data);
    }).catch(_ => {
        res.sendStatus(500);
    });
}); */

/* app.post('/users', (req, res) => {
    addUser(req.body.name).then(_ => res.sendStatus(200)).catch(_ => sendStatus(500));
}); */

app.get('/artists', (req, res) => {
    db.collection('artists').find().toArray((err, docs) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.send(docs);
    });
});


// ------------- Авторизация----------------
app.post('/auth', (req, res) => {
    const user = users.find(u => u.email === req.body.email);
    if (user && req.body.password === user.password) {
        res.send(user.id.toString());
    } else {
        res.sendStatus(500);
    }
});

// ----------- Проверка связи и инвайтов ------------
app.get('/connection/:id', (req, res) => {
    connectionControl(req.params.id).then(response => {
        res.send(response);
    }).catch(_ => res.sendStatus(500));
});

// ---------- Получение списка индивидуальных тасков ------
app.get('/tasks', (req, res) => {
    loadTasks(req.query.token).then(result => {
        res.send(result);
    }).catch(_ => res.sendStatus(500));
});

// -------- Добавление таска -------------
app.post('/tasks', (req, res) => {
    const token = req.query.token;
    const task = req.body;
    addTask(token, task).then(_ => {
        res.send(task.toString());
    }).catch(_ => res.sendStatus(500));
});

/* app.delete('/user', (req, res) => {
    deleteUser(req.body.id).then(_ => res.sendStatus(200)).catch(_ => sendStatus(500));
}); */

/* function getUser(id) {
    return new Promise((resolve, reject) => {
        const user = users.find(u => +u.id === +id);
            if (user) {
                resolve(user);
            }            
            reject();
    }).catch(_ => reject());
} */

/* function addUser(name) {
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
            saveUserChanges().then(_ => resolve()).catch(_ => reject());
        }); 
}

function deleteUser(id) {
    return new Promise((resolve, reject) => {
        getUser(id).then(res => {
            if (res) {
                const index = users.indexOf(res);
                users.splice(index, 1);
                saveUserChanges().then(_ => resolve()).catch(_ => reject());
            } else {
                reject();
            }
        }).catch(_ => reject());
    });
} */

function getUsers() {
    return new Promise((resolve, reject) => {
        fs.readFile('data/users.json', 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}
function connectionControl(id) {
    return new Promise((resolve, reject) => {
        fs.readFile('data/invites.json', 'utf-8', (err, data) => {
            if (err) {
                reject();
            }
            const invites = JSON.parse(data);
            const invite = invites.filter(i => +i.id_receiver === +id);
            if (invite) {
                resolve(invite);
            }
            resolve([]);
        })
    });
}

function loadTasks(id) {
    return new Promise((resolve, reject) => {
        fs.readFile('data/tasks.json', 'utf-8', (err, data) => {
            if (err) {
                reject();
            } else {
                const allTasks = JSON.parse(data);
                const tasks = allTasks.find(t => +t.id === +id);
                if (tasks) {
                    resolve(tasks.items);
                }
                resolve([]);
            }
        });
    });
}

function addTask(id, task) {
    return new Promise((resolve, reject) => {
        fs.readFile('data/tasks.json', 'utf-8', (err, data) => {
            if (err) {
                reject();
            } else {
                const allTasks = JSON.parse(data);
                const tasks = allTasks.find(t => +t.id === +id);
                if (tasks) {
                    tasks.items.push(task);
                } else {
                    allTasks.push({
                        id,
                        items: [task]
                    });
                }
                fs.writeFile('data/tasks.json', JSON.stringify(allTasks), (err) => {
                    if (err) {
                        reject();
                    }
                    resolve();
                });
                resolve();
            }
        });
    });
}

/* function saveUserChanges() {
    return new Promise((res, rej) => {
        fs.writeFile('data/users.json', JSON.stringify(users), (err) => {
            if (err) {
                rej();
            }
            res();
        });
    });
} */



//heroku

const port = process.env.PORT || 3000;

// getUsers().then(data => {
//     users = JSON.parse(data);
//     app.listen(port);
//     console.log('API app started! Port: ', port);
// }).catch(_ => {
//     console.log('No Database');
// });

MongoClient.connect('mongodb://dmi3z.herokuapp.com', (err, database) => {
    if (err) {
        return console.log(err);
    }
    db = database.db('tasklist');
    app.listen(port);
    console.log('API app started! Port: ', port);
})

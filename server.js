const http = require('http');
let { v4: uuidv4 } = require('uuid');
const errHandler = require('./errorHandle');
let todos = [
    {"id": uuidv4(), "task": "brush my teeth"},
    {"id": uuidv4(), "task": "go to the gym"},
    {"id": uuidv4(), "task": "do homework"},
    {"id": uuidv4(), "task": "go to sleep"}
];

const requestListener = function (req, res) {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    };

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    

    if (req.url === "/todos" && req.method === "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "true",
            "data": todos,
            "msg": "success"
        }));
        res.end();
    } else if(req.url === "/todos" && req.method === "POST"){
        req.on('end', () => {
            try {
                const { task } = JSON.parse(body);
                if (!task) {
                    errorHandle("Task is required", req, res);
                    return;
                }
                const newTodo = { id: uuidv4(), task };
                todos.push(newTodo);
                res.writeHead(201, headers);
                res.write(JSON.stringify({
                    "status": "true",
                    "data": newTodo,
                    "msg": "success"
                }));
                res.end();
            } catch (err) {
                errHandler(err, req, res);
            }
        });
    } else if(req.url === "/todos" && req.method === "DELETE") {
        todos.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "true",
            "data": todos,
            "msg": "success"
        }));
        res.end();
    } else if(req.url.startsWith("/todos/") && req.method === "DELETE") {
        const todoId = req.url.split("/").pop();
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) {
            errHandler(new Error("Todo not found. Delete failed."), req, res);
            return;
        }
        todos.splice(todoIndex, 1);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "true",
            "data": todos,
            "msg": "success"
        }));
        res.end();
    } else if(req.url.startsWith("/todos/") && req.method === "PATCH") {
        req.on('end', () => {
            try {
                const task = JSON.parse(body).task;
                const todoId = req.url.split("/").pop();
                const todoIndex = todos.findIndex(todo => todo.id === todoId);
                console.log("Updating todo with id:", todoId, "to task:", task);
                if (todoIndex === -1) {
                    errHandler(new Error("Todo not found. Update failed."), req, res);
                    return;
                }
                todos[todoIndex].task = task;
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status": "true",
                    "data": todos,
                    "msg": "success"
                }));
                res.end();
            } catch (err) {
                errHandler(err, req, res);
            }
        });
    } else if(req.method === "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "msg": "not found"
        }));
        res.end();
    }

}


const server = http.createServer(requestListener);
server.listen(3005); 

// *1.留意 port
// *2.留意 start script
// *3.部署的 node 版本
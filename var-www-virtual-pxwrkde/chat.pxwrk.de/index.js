"use strict";
exports.__esModule = true;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
console.log('listen');
app.set('port', 3000);
http.listen(app.get('port'), '0.0.0.0', function () {
    console.log('✅ Server started');
});
app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    return;
});
var User = /** @class */ (function () {
    function User(id, color, name) {
        this.id = id;
        this.color = color;
        this.name = name;
    }
    return User;
}());
var Users = /** @class */ (function () {
    function Users() {
        this.possibleNames = [
            'Sirius Black',
            'Tom Riddle',
            'Rubeus Hagrid',
            'Albus Dumbledore',
            'Severus Snape',
        ];
        this.data = [];
    }
    Users.prototype.generateNewId = function () {
        var result;
        do {
            result = Math.floor(Math.random() * 100);
        } while (this.data.find(function (item) { return item.id === result; }));
        return result;
    };
    Users.prototype.generateNewColor = function () {
        var result;
        do {
            result = "hsl(" + Math.floor(Math.random() * 361) + ", 100%, 20%)";
        } while (this.data.find(function (item) { return item.color === result; }));
        return result;
    };
    Users.prototype.shuffleUserNameArray = function (array) {
        /**
         * Shuffles array in place.
         * @param {Array} a items An array containing the items.
         */
        function shuffle(a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
            return a;
        }
        return shuffle(array);
    };
    Users.prototype.generateNewName = function () {
        var possibleNames = this.shuffleUserNameArray(this.possibleNames);
        var _loop_1 = function (iterator) {
            if (this_1.data.find(function (item) { return item.name === iterator; }))
                return "continue";
            return { value: iterator };
        };
        var this_1 = this;
        for (var _i = 0, possibleNames_1 = possibleNames; _i < possibleNames_1.length; _i++) {
            var iterator = possibleNames_1[_i];
            var state_1 = _loop_1(iterator);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return 'anon';
    };
    Users.prototype.addUser = function () {
        var newId = this.generateNewId();
        var newColor = this.generateNewColor();
        var newName = this.generateNewName();
        var newUser = new User(newId, newColor, newName);
        this.data.push(newUser);
        return newUser;
    };
    Users.prototype.get = function (id) {
        return this.data.find(function (item) { return item.id === id; });
    };
    return Users;
}());
var users = new Users();
io.on('connection', function (socket, name) {
    console.log('✅ user joined');
    var newUser = users.addUser();
    io.emit('new id', newUser.id);
    io.emit('user join', newUser, { "for": 'everyone' });
    socket.on('disconnect', function () {
        io.emit('some user left', { "for": 'everyone' });
    });
    socket.on('user send message', function (param) {
        var USER = users.get(param.id);
        io.emit('user send message', param.msg, USER, { "for": 'everyone' });
    });
});

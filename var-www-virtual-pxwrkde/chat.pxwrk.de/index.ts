import { generateKeyPair } from "crypto";

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

console.log('listen');

app.set('port', 3000);
http.listen(app.get('port'), '0.0.0.0', () => {
  console.log('✅ Server started');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  return;
});

class User {
  public color : string;
  public name;
  public id;

  constructor(id : number, color : string, name : string) {
    this.id = id;
    this.color = color;
    this.name = name;
  }
}

class Users {
  private data : User[];

  constructor() {
    this.data = [];
  }
  private generateNewId() : number {
    let result : number;
    do {
      result = Math.floor(Math.random() * 100);
    } while (this.data.find(item => item.id === result));
    return result;
  }

  private generateNewColor() : string {
    let result : string;
    do {
      result = `hsl(${Math.floor(Math.random() * 361)}, 100%, 20%)`;
    } while (this.data.find(item => item.color === result));
    return result;
  }

  private possibleNames = [
    'Sirius Black',
    'Tom Riddle',
    'Rubeus Hagrid',
    'Albus Dumbledore',
    'Severus Snape',
  ];

  private shuffleUserNameArray(array : string[]) : string[] {
    /**
     * Shuffles array in place.
     * @param {Array} a items An array containing the items.
     */
    function shuffle(a : any) {
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
  }

  private generateNewName() : string {
    const possibleNames = this.shuffleUserNameArray(this.possibleNames);
    for (const iterator of possibleNames) {
      if (this.data.find(item => item.name === iterator)) continue;
      return iterator;
    }
    return 'anon';
  }

  public addUser() : User {
    const newId = this.generateNewId();
    const newColor = this.generateNewColor();
    const newName = this.generateNewName();
    const newUser = new User(newId, newColor, newName);
    this.data.push(newUser);
    return newUser;
  }

  get(id : number) : User | undefined {
    return this.data.find(item => item.id === id);
  }
}

type user = { name : 'anon', id : number };
let users = new Users();

io.on('connection', (socket, name) => {
  console.log('✅ user joined');

  const newUser = users.addUser();
  io.emit('new id', newUser.id);

  io.emit('user join', newUser, { for: 'everyone' });
  socket.on('disconnect', () => {
    io.emit('some user left', { for: 'everyone' });
  });
  socket.on('user send message', (param : { id: number, msg: string }) => {
    const USER = users.get(param.id);
    io.emit('user send message', param.msg, USER, { for: 'everyone' });
  });
});

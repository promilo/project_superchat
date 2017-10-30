const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const { storeMessage, getMessages } = require('./services/redisstorage');

app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
  '/socket.io',
  express.static(__dirname + '/node_modules/socket.io-client/dist/')
);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
var roomName = 'emptyrooms';
var userName = 'Anonymous';

io.on('connection', client => {
  console.log('new connection');
});

app.get('/', (req, res) => {
  // might change it to app.get('/:roomName')
  getMessages(roomName).then(values => {
    Promise.all(values)
      .then(messages => {
        console.log("app.get messages", messages);
        res.render('index', { messages });
      })
      .catch(err => {
        console.log(err);
      });
  });
});

app.post('/', (req, res) => {
  // this is to post a message.
  // Probably change it into app.post('/:chatroom/newmessage')
  // Have to make sure that the form button have a different id that
  // that indicates where to post the message
  let messageBody = req.body.message;
  storeMessage(messageBody, userName, roomName);
  io.emit('message', messageBody, userName)
  // figure out how to sort it.
  res.redirect('back');
});

app.post('/:chatroom', (req, res) => {
  // to create a new chatroom
});

app.post('/login', (req, res) => {
  // reassign the global var username
  // save cookie

});

app.post('/logout', (req, res) => {
  //clear the cookie.
  // change the user login name to anonymous.

});


server.listen(3000, () => {
  console.log('Listening on port 3000');
})

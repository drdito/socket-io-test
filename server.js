const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
  if (err){
    throw err;
  }

  console.log('Mongo DB connected....');

  //connect to Socket.io
  client.on('connection', function(){
    let chat = db.collection('chats');

    //create function to send status
    sendStatus = function(s){
      socket.emit('status', s);
    }

    //Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err
      }

      //emit the messages
      socket.emit('output', res);
    });
    
    //handle input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;

      //check for name and message
      if(name === '' || message === ''){
        sendStatus('Please enter a name and message');
      }
      else {
        chat.insert({name: message, message: message}, function(){
          client.emit('output', [data]);

          //send status object
          sendStatus({
            message: 'Message Sent',
            clear: true
          }); 
        });
      }

    });
    
    //handle clear
    socket.on('clear', function(data){
      chat.remove({}, function(){
        socket.emit('cleared');
      })
    })
  }); 
});
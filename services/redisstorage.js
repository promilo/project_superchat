const redis = require('redis');
const redisClient = redis.createClient();


const storeMessage = (messageBody, author, room) => {
  var dateID = Date.now();
  var msgid = 'msg:' + dateID;
  var rooms = 'room:' + room;
  console.log('msgid', msgid);
  // store msg info
  redisClient.hmset(
    msgid,'content', messageBody, 'author', author, 'room', room, 'date', dateID
  );
  // store where msgid is located in which room. Assuming that the roomname is unique
  redisClient.lpush(rooms, msgid, (err, result) => {
    console.log("result", result)
  });
};

const getMessages = roomName => {
  return new Promise((resolve, reject) => {
    var messages = [];
    getallmsgids(roomName)
      .then(messageIDsList => {
        messageIDsList.forEach(messageID => {
          var msgPromise = getmessagethroughid(messageID);
          messages.push(msgPromise);
        });
        resolve(messages);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const getmessagethroughid = msgId => {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(msgId, (err, messageinfo) => {
      if (err) {
        reject(err);
      } else {
        resolve(messageinfo);
      }
    });
  });
};

const getallmsgids = roomName => {
  let rooms = 'room:' + roomName;
  return new Promise((resolve, reject) => {
    redisClient.lrange(rooms, 0, 50, (err, message) => {
      if (err) {
        reject(err);
      } else {
        console.log("getallmsgids", message);
        // next task is to sort them.... using the date
        resolve(message);
      }
    });
  });
};
// console.log(getallmsgids("emptyrooms").then( result => {
//   console.log("result", result)
// }))
module.exports = {
  storeMessage,
  getMessages
};

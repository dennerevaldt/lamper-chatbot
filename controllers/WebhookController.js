var debug   = require('debug')('api:ctrlWebhook'),
    request = require('request');

// PRIVATE FN

var sendTextMessage = function(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

var callSendAPI = function(messageData) {
  console.log('MSG DATA', messageData);
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: process.env.TKN_MSG_FB
    },
    method: 'POST',
    json: messageData
  }, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log('Mensagem enviada com sucesso');
      console.log(body.recipient_id);
    } else {
      console.log('Não foi possível enviar a mensagem');
      console.log(response.body.error.message);
    }
  });
}

var checkMessage = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  //////

  var messageID = message.mid;
  var messageText = message.text;
  var attachments = message.attachments;

  if (messageText.indexOf('grêmio') || messageText.indexOf('gremio') || messageText.indexOf('tricolor') || messageText.indexOf('gremista')) {
    messageText = 'time';
  }

  if (messageText) {
    switch (messageText) {
      case 'oi':
        sendTextMessage(senderID, 'E aai! Tudo certo? Meu nome é LAMPER e eu sou o robô da LAMP :)');
        break;
      case: 'time':
        sendTextMessage(senderID, 'Me desculpe meu querido amigo, mas eu LAMPER sou #INTER :D');
        break;
      case 'tchau':

        break;
      default:

    }
  } else if(attachments) {
    // anexos
  }
}

// PRIVATE FN

function WebhookController(WebhookModel) {
  this.model = WebhookModel;
}

WebhookController.prototype.getWebhook = function(request, response, next) {
  if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === process.env.PASS_FB) {
    response.status(200).send(request.query['hub.challenge']);
  } else {
    response.sendStatus(403);
  }
};

WebhookController.prototype.postWebhook = function(request, response, next) {
  var data = request.body;

  if (data && data.object === 'page') {

    // Percorrer todas as entradas entry
    data.entry.forEach(function(entry){
      var pageId = entry.id;
      var timeOfEvent = entry.time;

      // Percorrer todas as mensagens
      entry.messaging.forEach(function(event){
        if (event.message) {
          checkMessage(event);
        }
      });

    });

    response.sendStatus(200);
  }

}

module.exports = function(WebhookModel) {
  return new WebhookController(WebhookModel);
};

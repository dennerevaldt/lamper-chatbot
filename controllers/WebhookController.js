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

  var msg = messageText ? messageText.toLowerCase() : undefined;

  if (msg) {

    // the zuera never ends
    if (msg.indexOf('grêmio') >= 0 || msg.indexOf('gremio') >= 0 || msg.indexOf('tricolor') >= 0 || msg.indexOf('gremista') >= 0) {
      messageText = 'time';
    }

    switch (msg) {
      case 'oi':
        sendTextMessage(senderID, 'Olá! Meu nome é LAMPER e eu sou o robô da LAMP :)');
        break;
      case 'time':
        sendTextMessage(senderID, 'Me desculpe meu querido amigo, mas o LAMPER aqui é #INTER :D');
        break;
      case 'tchau':
        sendTextMessage(senderID, 'Até logo! Volte sempre.');
        break;
      default:
        sendTextMessage(senderID, 'Não entendi sua necessidade/comando. :(');
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
      // Percorrer todas as mensagens
      entry.messaging.forEach(function(event){
        if (event.message) {
          checkMessage(event);
        } else if(event.postback && event.postback.payload) {
          // switch payload
          switch (event.postback.payload) {
            case 'click_start':
              sendTextMessage(event.sender.id, 'Bora láa então! :D');
              break;
            default:

          }
        }
      });

    });

    response.sendStatus(200);
  }

}

module.exports = function(WebhookModel) {
  return new WebhookController(WebhookModel);
};

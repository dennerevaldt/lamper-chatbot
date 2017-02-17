var debug   = require('debug')('api:ctrlWebhook'),
    request = require('request');

// PRIVATE FN

var _state = [];

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

var sendFirstMenu = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Você já conhece nossos serviços, equipe, clientes?',
          buttons: [
            {
              type: 'web_url',
              url: 'https://www.lampti.com.br',
              title: 'Acesse nosso site'
            },
            {
              type: 'postback',
              title: 'Outra opção',
              payload: 'click_other'
            },
            {
              type: 'postback',
              title: 'Localização',
              payload: 'click_location'
            },
            {
              type: 'postback',
              title: 'Ver vídeo institucional',
              payload: 'click_video'
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

var sendRequestLocation = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Por favor, compartilhe sua localização',
      quick_replies:[
        {
          "content_type":"location",
        }
      ]
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

  /////////////////

  var messageID = message.mid;
  var messageText = message.text;
  var attachments = message.attachments;

  var msg = messageText ? messageText.toLowerCase() : undefined;

  if (msg) {
    if (_state[senderID]) {
      switch (_state[senderID]) {
        case 'options_menu':
          switch (msg) {
            case 'sim':
              sendFirstMenu(senderID);
              break;
            case 'não':
              sendTextMessage(senderID, 'Obrigado por nos procurar, curta nossa página!');
              break;
            default:
            // default
          }
          break;
        default:
          // default
      }
    } else {
      // Não é mais primeiro momento, estado inicial
      switch (msg) {
        case 'oi':
          sendTextMessage(senderID, 'Olá! Meu nome é LAMPER e eu sou o robô da LAMP :)');
          break;
        case 'tchau':
          sendTextMessage(senderID, 'Até logo! Volte sempre.');
          break;
        default:
          sendTextMessage(senderID, 'Não entendi sua necessidade/comando. :(');
      }
    }
  } else if(attachments) {
    // anexos
  }
}

var showOptionsMenu = function(recipientId) {
  setTimeout(function(){
    sendTextMessage(recipientId, 'Posso te ajudar com mais alguma coisa? :)');
    _state[recipientId] = 'options_menu';
  }, 1500);
}

var sendOnViewRequest = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on'
  };
  callSendAPI(messageData);
}

var sendOffViewRequest = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_off'
  };
  callSendAPI(messageData);
}

var sendMarkSeenRequest = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'mark_seen'
  };
  callSendAPI(messageData);
}

var sendAttachmentVideo = function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'video',
        payload: {
          url: 'https://www.youtube.com/watch?v=PGnSa5GZDjw'
        }
      }
    }
  };
  callSendAPI(messageData);
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
              sendFirstMenu(event.sender.id);
              break;
            case 'click_other':
              sendTextMessage(event.sender.id, 'Você clicou na segunda opção');
              showOptionsMenu(event.sender.id);
              break;
            case 'click_location':
              sendRequestLocation(event.sender.id);
              break;
            case 'click_video':
              sendAttachmentVideo(event.sender.id);
              showOptionsMenu(event.sender.id);
              break;
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

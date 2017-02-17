var debug  = require('debug')('api:ctrlWebhook');

var handleNotFound = function(data) {
  if(!data) {
    var err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  return data;
};

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
          console.log(event.message);
        }
      });

    });

    response.sendStatus(200);
  }

}

module.exports = function(WebhookModel) {
  return new WebhookController(WebhookModel);
};

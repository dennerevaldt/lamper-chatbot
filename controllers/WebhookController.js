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
  if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === process.env.PWD_FB) {
    response.status(200).send(req.query['hub.challenge']);
  } else {
    response.sendStatus(403);
  }
};

module.exports = function(WebhookModel) {
  return new WebhookController(WebhookModel);
};

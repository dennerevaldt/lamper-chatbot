var express = require('express'),
    router  = express.Router();

var WebhookController = require('../controllers/WebhookController')();

router.get('/', WebhookController.getWebhook.bind(WebhookController));

module.exports = router;

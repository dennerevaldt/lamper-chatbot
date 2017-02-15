var express = require('express'),
  	router  = express.Router();

// revision
router.use('/webhook', require('./webhook'));

module.exports = router;

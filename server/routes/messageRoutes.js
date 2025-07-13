const express = require('express');
const router = express.Router();

const messages = require('../store').messages;

router.get('/', (req, res) => {
  res.json(messages);
});

module.exports = router;
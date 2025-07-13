const express = require('express');
const router = express.Router();

const users = require('../store').users;

router.get('/', (req, res) => {
  res.json(Object.values(users));
});

module.exports = router;
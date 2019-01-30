const router = require('express').Router();
const clients = require('./clients');
const jobs = require('./jobs');

router.get('/', function (req, res) {
  res.status(200).json({ message: 'router Initialized!' });
});

router.use('/clients', clients);
router.use('/jobs', jobs);

module.exports = router;

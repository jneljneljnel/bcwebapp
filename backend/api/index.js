const router = require('express').Router();
const clients = require('./clients');
const jobs = require('./jobs');
const inspections = require('./inspections');

router.get('/', function (req, res) {
  res.status(200).json({ message: 'router Initialized!' });
});

router.use('/clients', clients);
router.use('/jobs', jobs);
router.use('/inspections', inspections);

module.exports = router;

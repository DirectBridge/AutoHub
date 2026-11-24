const express = require('express');
const { getListings } = require('../controller/listingController');

const router = express.Router();

router.get('/', getListings);

module.exports = router;


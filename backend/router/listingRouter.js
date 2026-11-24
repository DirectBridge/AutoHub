const express = require('express');
const { getListings, getListingById } = require('../controller/listingController');

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);

module.exports = router;

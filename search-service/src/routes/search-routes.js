const express  =require('express');
const { authenticateReq } = require('../middleware/auth-middleware');
const { searchPostController } = require('../controllers/search-controller');

const router = express.Router();


router.post('/search-post',authenticateReq,searchPostController);

module.exports = router;
const express  =require('express');
const { authenticateReq } = require('../middleware/auth-middleware');
const { searchPostController } = require('../controllers/search-controller');
const { handlePostDeleted } = require('../EventHandler/search-eventhandler');

const router = express.Router();


router.get('/search-post',authenticateReq,searchPostController);
router.delete('/delete-post',handlePostDeleted);
module.exports = router;
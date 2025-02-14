const express = require('express');
const { createPost,getallPost } = require('../controllers/post-controller');
const {authenticateReq} = require('../middleware/auth-middleware');

const router = express();
//  a middle that tells if an user if auth or not
router.use(authenticateReq);


router.post('/create-post',createPost);

module.exports = router;

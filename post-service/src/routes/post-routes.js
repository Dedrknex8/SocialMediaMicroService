const express = require('express');
const { createPost,getallPost,getSinglepost,deletePost } = require('../controllers/post-controller');
const {authenticateReq} = require('../middleware/auth-middleware');
const { createPostRateLimit,getPostLimiter  } = require('../middleware/Sensitive-middleware');

const router = express.Router();
// a middle that tells if an user if auth or not
router.use(authenticateReq);


router.post('/create-post',createPostRateLimit,createPost);
router.get('/all-posts',getPostLimiter,getallPost);
router.get('/:id',getPostLimiter,getSinglepost);
router.delete('/delete/:id',deletePost);
module.exports = router;
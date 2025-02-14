const express = require('express');
const {registerUser,loginUser,userRefreshToken}  = require('../controllers/identity-controller');
const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/refresh-token',userRefreshToken);

module.exports = router;
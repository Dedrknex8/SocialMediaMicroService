const express = require('express');
const {registerUser,loginUser,userRefreshToken,userLogout,deleteUser}  = require('../controllers/identity-controller');
const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/refresh-token',userRefreshToken);
router.post('/logout',userLogout);
router.post('/delete-user',deleteUser)

module.exports = router;
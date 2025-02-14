require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const postroutes = require('./routes/post-routes');
const errorHanlder = require('./middleware/errorHandler')
const logger = require('./utils/logger');
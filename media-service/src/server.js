require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const mediaRoutes = require('./routes/media-router');
const errorhandler = require('./middleware/errorHandler');
const logger = require('./utils/logger')
const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;
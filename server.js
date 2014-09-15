var http = require('http');
var express = require('express');
var sass = require('node-sass');

var app = express();

app.use(sass.middleware({ 
    src: __dirname + '/public/css/sass/',
    dest: __dirname + '/public/css/',
    debug: true,
    prefix: '/css',
    outputStyle: 'compressed'
  }));

app.use(express.static(__dirname+'/public/'));

var server = http.createServer(app);

server.listen(82);

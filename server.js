'use strict';

const Hapi = require('hapi');
const Nes = require('nes');
const Inert = require('inert');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });
server.register([Inert, Nes], () => {});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.subscription('/item/{id}');

server.route({
    method: 'POST',
    path: '/broadcast',
    handler: function (request, reply) {
        console.log(request.payload);
        server.publish(`/item/${request.payload.userId}`,  request.payload);
        reply('Sent broadcast');
    }
});

server.route({
    method: 'GET',
    path: '/assets/{filename}',
    handler: function (request, reply) {
        reply.file(`./lib/${request.params.filename}`);
    }
});

server.route({
    method: 'GET',
    path: '/src/{filename}',
    handler: function (request, reply) {
        reply.file(`./src/${request.params.filename}`);
    }
});

server.route({
    method: 'GET',
    path: '/{path*}',
    handler: function (request, reply) {
        reply.file('./src/index.html');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
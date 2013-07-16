'use strict';

var whisperChirpApp = angular.module('whisperChirpApp', ['ngResource']);

whisperChirpApp.config(function($routeProvider) {
  $routeProvider.
      when('/', {
        controller: 'ChatRoomController',
        templateUrl: 'static/views/chatroom.html'
      }).
      otherwise({
        controller: 'ChatRoomController',
        templateUrl: 'static/views/404.html'
      });
});

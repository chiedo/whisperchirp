'use strict';

var whisperChirpApp = angular.module('whisperChirpApp', ['ngResource']);

whisperChirpApp.config(function($routeProvider) {
  $routeProvider.
      when('/', {
        controller: 'ChatRoomController',
        templateUrl: 'views/chatroom.html'
      }).
      otherwise({
        templateUrl: 'views/404.html'
      });
});

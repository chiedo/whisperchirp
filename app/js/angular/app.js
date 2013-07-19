'use strict';

var whisperChirpApp = angular.module('whisperChirpApp', ['ngResource']);

whisperChirpApp.config(function($routeProvider) {
  $routeProvider.
      when('/', {
        controller: 'ChatRoomController',
        templateUrl: 'static/views/angular/chatroom.html'
      }).
      otherwise({
        controller: 'ChatRoomController',
        templateUrl: 'static/views/home/404.html'
      });
});

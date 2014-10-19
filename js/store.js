/*jshint unused:false */
app.module('todoStorage', function() {

  'use strict';

  var STORAGE_KEY = 'todos-qoo-koes5';

  return {
    fetch: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    save: function (todos) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  };

});

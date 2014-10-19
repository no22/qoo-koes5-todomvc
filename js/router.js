/*jshint unused:false */
app.module('routerInit', function(Router) {

  'use strict';

  return function routerInit(vm) {
    var router = new Router();

    Object.keys(vm.todos.filters).forEach(function (filter) {
      router.on(filter, function () {
        vm.filter$ = filter;
      });
    });

    router.configure({
      notfound: function () {
        window.location.hash = '';
        vm.filter$ = 'all';
      }
    });

    router.init();

  };

});

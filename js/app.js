(function (app) {
  'use strict';

  app.module('KEY', function() {

    return {
      ENTER: 13,
      ESCAPE: 27
    };

  }).module('Todo', function(qoo) {

    return qoo.ko.KoBase.extend({

      init: function Todo(todo) {
        this.title$ = todo.title;
        this.completed$ = todo.completed;
      }

    });

  }).module('TodoDebug', function(qoo, Todo) {

    return Todo.extend({

      title$Subscriber: function(value) {
        console.log('Title changed!! ' + value);
      }

    });

  }).module('Todos', function(qoo, _, todoStorage, Todo) {

    return qoo.ko.KoBase.extend({

      init: function Todos() {
        this.list$ = [];
        this.load();
      },

      filters: {
        all: function() {
          return true;
        },
        active: function(todo) {
          return !todo.completed$;
        },
        completed: function (todo) {
          return todo.completed$;
        }
      },

      addTodo: function(todo) {
        this.list$.push(new Todo(todo));
      },

      removeTodo: function(todo) {
        this.list$.remove(todo);
      },

      filter: function(filter) {
        return _.filter(this.list$, this.filters[filter]);
      },

      removeDone: function() {
        this.list$ = this.filter('active');
      },

      changeState: function(state) {
        _.forEach(this.list$, function(todo){
          todo.completed$ = state;
        });
      },

      length$$: function() {
        return this.list$.length;
      },

      load: function() {
        this.list$ = _.map(todoStorage.fetch(), function(todo) {
          return new Todo(todo);
        });
      },

      save: function() {
        todoStorage.save(_.map(this.list$, function(todo) {
          return {title: todo.title$, completed: todo.completed$};
        }));
      }

    });

  }).module('ViewModel', function(qoo, Todos) {

    return qoo.ko.KoBase.extend({

      init: function ViewModel() {
        this.todos = new Todos();
        this.newTodo$ = '';
        this.editedTodo$ = null;
        this.filter$ = 'all';
        this.beforeEditCache = null;
      },

      autosave$: function() {
        this.todos.save();
        console.log("Saved!");
      },

      getLabel: function(count) {
        return count === 1 ? 'item' : 'items';
      },

      remaining$$: function() {
        return this.todos.filter('active').length;
      },

      completed$$: function() {
        return this.todos.filter('completed').length;
      },

      toggleAllHandler: function() {
        this.todos.changeState(!!this.remaining$$);
        return true;
      },

      addTodoHandler: function() {
        var value = this.newTodo$ && this.newTodo$.trim();
        if (!value) return;
        this.todos.addTodo({ title: value, completed: false });
        this.newTodo$ = '';
      },

      removeTodoHandler: function(that, todo) {
        this.todos.removeTodo(todo);
      },

      editTodoHandler: function(that, todo) {
        this.beforeEditCache = todo.title$;
        this.editedTodo$ = todo;
      },

      doneEditHandler: function(that, todo) {
        if (!this.editedTodo$) return;
        this.editedTodo$ = null;
        todo.title$ = todo.title$.trim();
        if (!todo.title$) {
          this.todos.removeTodo(todo);
        }
      },

      cancelEditHandler: function(that, todo) {
        if (!this.editedTodo$) return;
        this.editedTodo$ = null;
        todo.title$ = this.beforeEditCache;
      },

      removeCompletedHandler: function() {
        this.todos.removeDone();
      }

    }).koOptions({

      autosave$: {
        extend: {
          rateLimit: {
            timeout: 500,
            method: 'notifyWhenChangesStop'
          }
        }
      }

    });

  }).module('eventKeyup', function(ko) {

    return function(keycode) {

      return {
        init: function(element, valueAccessor, allBindingsAccessor, data, bindingContext) {
          ko.bindingHandlers.event.init(element, function() {
            return {
              keyup: function(data, event) {
                if (event.keyCode === keycode) {
                  valueAccessor().call(this, data, event);
                }
              }
            };
          }, allBindingsAccessor, data, bindingContext);
        }
      };

    };

  }).module('customBindings', function(ko, eventKeyup, KEY) {

    ko.bindingHandlers['todo-forcus'] = {
      update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        if (!value) return;
        setTimeout(function() {
          element.focus();
        }, 0);
      }
    };
    ko.bindingHandlers.enterKey = eventKeyup(KEY.ENTER);
    ko.bindingHandlers.escapeKey = eventKeyup(KEY.ESCAPE);

  }).module('main', function(qoo, routerInit, customBindings) {

    qoo.ko.init(this, function(viewModels) {
      routerInit(viewModels.ViewModel);
    });

  }).inject({

    Todos: ['qoo', '_', 'todoStorage', 'TodoDebug']

  }).run('main');

})(app);

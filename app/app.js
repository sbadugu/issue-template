(function() {
  var app = angular.module('it', ['ngRoute', 'firebase']);

  app.constant('Firebase', Firebase);
  app.constant('_', _);

  function getTeplateInfo($q, util, service, fn, $route) {
    var routeParams = $route.current.params;
    return util.getDataSnapshot($q, service, fn, {
      name: routeParams.name,
      owner: routeParams.owner,
      repo: routeParams.repo
    });
  }

  var resolve = {
    template: function($q, util, TemplateService, $route) {
      return getTeplateInfo($q, util, TemplateService, TemplateService.getTemplate, $route);
    },
    fields: function($q, util, TemplateService, $route) {
      return getTeplateInfo($q, util, TemplateService, TemplateService.getTemplateFields, $route);
    },
    allTemplates: function($q, util, TemplateService) {
      return util.getDataSnapshot($q, TemplateService, TemplateService.getAllTemplates);
    }
  };

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: './app/home/home.html',
        controller: 'HomeCtrl'
      })
      .when('/new-template', {
        templateUrl: './app/templates/template.html',
        controller: 'TemplateCtrl',
        resolve: {
          template: function($q, util, TemplateService, $location) {
            var copy = $location.search().copy;
            if (copy) {
              return util.getDataSnapshot($q, TemplateService, TemplateService.getTemplate, {
                owner: $location.search().owner,
                repo: $location.search().repo,
                name: $location.search().name
              });
            } else {
              return {
                name: '',
                owner: '',
                repo: '',
                template: '',
                fields: [
                  {
                    name: '',
                    element: '',
                    type: '',
                    value: ''
                  }
                ]
              }
            }
          },
          mode: function($location) {
            if ($location.search().copy) {
              return 'copy';
            } else {
              return 'new';
            }
          }
        }
      })
      .when('/:owner/:repo/:name/edit', {
        templateUrl: './app/templates/template.html',
        controller: 'TemplateCtrl',
        resolve: {
          template: resolve.template,
          mode: function() {
            return 'edit';
          }
        }
      })
      .when('/search', {
        templateUrl: './app/search/search-templates.html',
        controller: 'SearchTemplatesCtrl',
        resolve: {
          owners: resolve.allTemplates
        }
      })
      .when('/:owner/:repo/:name', {
        templateUrl: './app/new-issue/new-issue.html',
        controller: 'NewIssueCtrl',
        resolve: {
          template: resolve.template,
          fields: resolve.fields
        }
      })
      .when('/:owner/:repo/:name/:number', {
        templateUrl: './app/new-issue/new-issue.html',
        controller: 'NewIssueCtrl',
        resolve: {
          template: resolve.template,
          fields: resolve.fields
        }
      })
      .otherwise('/');
  });
})();
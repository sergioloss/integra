'use strict';

var app = angular.module('Integra-0.3', [
    'ui.router', 
    'ngMaterial', 
    'ngMessages', 
    'ngStorage', 
    'ngMockE2E', 
    //'ui.grid',
    'auto-scroll'
]);
app.run(run);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$mdIconProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $mdIconProvider) {
        
        // $locationProvider.html5Mode(true);
        
        // default route
        $urlRouterProvider.otherwise('/');
        
        // app routes
        $stateProvider
        .state('app', {
            url: '/',
            views: {
                'header': {
                    templateUrl: 'views/shared/header.html'
                },
                'main-menu': {
                    templateUrl: 'views/shared/mainmenu.html',
                    controller: 'MainMenuController',
                    controllerAs: 'mainMenu'
                },
                'nav': {
                    templateUrl: 'views/shared/nav.html'
                },
                'content': {
                    templateUrl: 'views/home/home.html',
                    controller: 'HomeController'
                },
                'footer': {
                    templateUrl: 'views/shared/footer.html'
                }
            }
        })
        
        .state('app.integrator', {
            url: 'integradores',
            views : {
                'content@': {
                    templateUrl: 'views/integrator/integrator.html',
                    controller: 'IntegratorController'
                }
            }
        })
        
        .state('app.integrator.detail', {
            url: '/:id',
            views: {
                'detail@app.integrator': {
                    templateUrl: 'views/integrator/integrator-detail.html',
                    controller: 'IntegratorController'
                }
            }
        })
        
        .state('login', {
            url: '/login',
            views: {
                'header': {
                    templateUrl: 'views/shared/header.html'
                },
                'main-menu': {
                    templateUrl: 'views/shared/mainmenu.html',
                    controller: 'MainMenuController',
                    controllerAs: 'mainMenu'
                },
                'nav': {
                    templateUrl: 'views/shared/nav.html'
                },
                'content@': {
                    templateUrl: 'views/authentication/authentication.html',
                    controller: 'AuthenticationController',
                    controllerAs: 'auth'
                }
            }
        })
        
        $mdIconProvider.defaultIconSet('img/icons/sets/core-icons.svg', 24);
        
        // ------
        
    }
]);

app.controller('mainController', ['$scope', 'Page', function ($scope, Page) {
    $scope.Page = Page;
}]);

app.factory('Page', function ($location) {
    var title = 'Integra-0.1';
    var subtitle = '';
    
    return {
        Title: function () {
            return title;
        },
        SetTitle: function (newTitle) {
            title = newTitle;
        },
        Subtitle: function () {
            return subtitle;
        },
        SetSubtitle: function (newSubtitle) {
            subtitle = newSubtitle;
        },
        Path: function () {
            return $location.path();
        }
    };
});

app.filter('keyboardShortcut', ['$window', function ($window) {
    return function(str) {
        if (!str) return;        
        var keys = str.split('-');
        var isOSX = /Mac OS X/.test($window.navigator.userAgent);
        
        var separator = (!isOSX || keys.length > 2) ? '+' : '';
        
        var abbreviations = {
            M: isOSX ? '⌘' : 'Ctrl',
            A: isOSX ? 'Option' : 'Alt',
            S: 'Shift'
        };
        
        return keys.map(function (key, index) {
            var last = index == keys.length - 1;
            return last ? key : abbreviations[key];
        }).join(separator);        
    };
}]);

function run($rootScope, $http, $location, $localStorage) {
    // keep user logged in after page refresh
    if ($localStorage.currentUser) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
    }

    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var publicPages = ['/login'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;
        if (restrictedPage && !$localStorage.currentUser) {
            $location.path('/login');
        }
    });
};

app.directive('inputClear', function () {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            var color = attrs.inputClear;
            var style = color ? "color:" + color + ";" : "";
            var action = attrs.ngModel + " = ''";
            element.after(
                '<md-button class="animate-show md-icon-button md-accent"' +
                'ng-show="' + attrs.ngModel + '" ng-click="' + action + '"' +
                'style="position: absolute; top: -11px; right: -5px; margin: 13px 0px;">' +
                '<div style="' + style + '"><b>X</b></div>' +
                '</md-button>');
        }
    };
});
    
app.directive('inputClearNoMaterial', function () {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            var color = attrs.inputClearNoMaterial;
            var style = color ? "color:" + color + ";" : "";
            var action = attrs.ngModel + " = ''";
            element.after(
                '<span class="animate-show"' +
                'ng-show="' + attrs.ngModel + '" ng-click="' + action + '"' +
                'style="position: absolute; margin: 3px -20px; cursor: pointer;">' +
                '<div style="' + style + '">x</div>' +
                '</span>');
        }
    };
});

app.directive('ngFocus', function($timeout) {
    return {
        link: function ( scope, element, attrs ) {
            scope.$watch( attrs.ngFocus, function ( val ) {
                if ( angular.isDefined( val ) && val ) {
                    $timeout( function () { element[0].focus(); } );
                }
            }, true);
            
            element.bind('blur', function () {
                if ( angular.isDefined( attrs.ngFocusLost ) ) {
                    scope.$apply( attrs.ngFocusLost );
                    
                }
            });
        }
    };
});

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Array.prototype.find = function (propName, propValue) {
  for (var i=0; i < this.length; i++)
    if (this[i][propName] == propValue)
      return this[i];
  // will return undefined if not found; you could return a default instead
}
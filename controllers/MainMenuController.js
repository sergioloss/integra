(function () {
    'use strict';

    app.controller('MainMenuController', ['$scope', '$mdDialog', '$location', 'AuthenticationService', 'Page', function ($scope, $mdDialog, $location, AuthenticationService, Page) {

        this.changeView = function (view) {
            $location.path(view);
        };

        this.logout = function () {
            AuthenticationService.logout();
            Page.SetTitle('Integra-0.2');
            $location.path('login');
        };

        this.sampleAction = function (name, ev) {
            $mdDialog.show($mdDialog.alert()
                .title(name)
                .textContent('You triggered the "' + name + '" action')
                .ok('OK')
                .targetEvent(ev)
            );
        };

    }]);
}());

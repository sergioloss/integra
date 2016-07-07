'use strict';

app.controller('AuthenticationController', ['$location', '$mdDialog', 'AuthenticationService', function ($location, $mdDialog, AuthenticationService) {
    
    var self = this;
    
    self.login = login;
    self.sampleAction = sampleAction;
    
    initController();
    
    function initController() {
        // reset login status
        AuthenticationService.logout();
    };
    
    function login() {
        self.loading = true;
        AuthenticationService.login(self.username, self.password, function(result) {
            if (result === true) {
                $location.path('/');
            } else {
                self.error = 'Username or password is incorrect';
                self.loading = false;
            }
        })
    };
    
    function sampleAction (name, ev) {
        $mdDialog.show($mdDialog.alert()
            .title(name)
            .textContent('You triggered the "' + name + '" action')
            .ok('OK')
            .targetEvent(ev)
        );
    };

    
}]);

app.factory('AuthenticationService', ['$http', '$localStorage', function ($http, $localStorage) {
    var service = {};
    
    service.login = login;
    service.logout = logout;
    
    return service;
    
    function login (username, password, callback) {
        $http.post('/api/authenticate', { username: username, password, password })
            .success( function (response) {
                // login successful if there's a token in the response
                if (response.token) {
                    // store username and token in local storage to keep user logged in between page refreshes
                    $localStorage.currentUser = { username: username, token: response.token };
                    
                    // add jwt token to auth header for all requests made by the $http service
                    $http.defaults.headers.common.Authorization = 'Bearer' + response.token;
                    
                    // execute callback with true to indicate successful login
                    callback(true);
                } else {
                    // execute callback with false to indicate failed login
                    callback(false);
                }
        });
    };
    
    function logout () {
        // remove user from local storage and clear http auth header
        delete $localStorage.currentUser;
        $http.defaults.headers.common.Authorization = '';
    };
    
}]);

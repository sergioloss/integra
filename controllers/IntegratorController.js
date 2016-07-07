'use strict';

app.controller('IntegratorController', [
    '$scope',
    '$stateParams',
    '$location',
    '$timeout',
    '$mdDialog',
    'IntegratorService',
    'Page',
    function ($scope, $stateParams, $location, $timeout, $mdDialog, IntegratorService, Page) {

        Page.SetTitle('Integradores');
        
        if (!$scope.integrators || $scope.integrators.length == 0) {
            $scope.integrators = IntegratorService.list();
        }
        
        $scope.result = {type: 'message', message: 'Selecione um integrador na lista ao lado para exibir os detalhes neste quadro.'};
        
        $scope.orderByFieldList = [{name: "id", label: "id"}, {name: "name", label: "Nome"}];
        $scope.defaultOrderFieldName = "name";
        $scope.defaultOrderFieldLabel = "Nome";
        $scope.orderFieldName = $scope.orderFieldName ? $scope.orderFieldName : $scope.defaultOrderFieldName;
        $scope.orderFieldLabel = $scope.orderFieldLabel ? $scope.orderFieldLabel : $scope.defaultOrderFieldLabel;
        $scope.orderByDesc = $scope.orderByDesc ? $scope.orderByDesc : false;        

        $scope.newContactFlag = false;
        $scope.defaultForm = { id: null, name: "", description: "", contacts: [] };
        $scope.editIntegrator = angular.copy($scope.defaultForm);        

        if ($stateParams.id == 'novo') {
            $scope.search = '';
            $scope.selected = {};            
            $scope.detailSubtitle = 'Incluir Novo Integrador';
            $scope.readOnly = false;
            $scope.activeId = null;
        } else if ($stateParams.id != '') {        
            var selected = IntegratorService.find($stateParams.id);
            if (selected) {  
                $scope.selected = selected;
                $scope.editIntegrator = angular.copy(selected);
                $scope.detailSubtitle = selected.name;
                $scope.readOnly = true; 
                $scope.selectListItem(selected.id);                
                $timeout(function () {
                    $scope.contactsOrderBy('name', false);
                });
            }
        };     
        
        var regex;
        $scope.$watch('search', function (searchString) {
            regex = new RegExp('\\b' + escapeRegExp(searchString), 'i');
            $scope.resetListScroll();
        });
        
        $scope.filterBySearch = function(integrator) {
            if (!$scope.search) return true;
            return (regex.test(integrator.id) || regex.test(integrator.name));
        };
        
        $scope.changeOrderByFieldName = function (orderFieldName) {
            if ($scope.orderFieldName == orderFieldName) {
                $scope.orderByDesc = !$scope.orderByDesc;
            } else {
                $scope.orderByDesc = false;
                $scope.orderFieldName = orderFieldName;
            }
            $scope.orderFieldName = orderFieldName;
            $scope.orderFieldLabel = $scope.orderByFieldList.find('name', orderFieldName)['label'];
            $scope.resetListScrollFlag = new Date().getTime();
        };
            
        $scope.orderBy = function (changeOrder) {
            var changeOrder = changeOrder ? changeOrder : true;
            //var order = $scope.orderByDesc ? 'desc' : 'asc';
            if (changeOrder) {
                $scope.orderByDesc = !$scope.orderByDesc;
            };
            $scope.resetListScrollFlag = new Date().getTime();            
        };
        
        $scope.findSelectedItem = function() {
            if ($scope.activeId) {
                $scope.resetListScroll();
            };
        };
        
        $scope.selectListItem = function (id) {
            $scope.activeId = id;            
            if ($scope.autoScrollIntegratorsList == false) {
                $scope.resetListScroll();
            };
            $scope.autoScrollIntegratorsList = false;
        };
        
        $scope.showDetails = function (id) {  
                    console.log("showDetails");

            $scope.activeId = id;
            $location.path('integradores/' + id);
            $scope.autoScrollIntegratorsList = true;
        };
        
        $scope.refreshList = function () {
            $scope.activeId = null;
            $scope.selected = null;
            $scope.search = "";
            
            $scope.orderFieldName = $scope.defaultOrderFieldName;
            $scope.orderFieldLabel = $scope.defaultOrderFieldLabel;
            $scope.orderByDesc = false;
            
            $location.path('integradores');
            
            $scope.resetListScroll();
        };
        
        $scope.resetListScroll = function() {
            /* to fire the auto-scroll function */
            $timeout(function () {
                // Mudar o valor de resetListScrollFlag para acionar o $watch(reset) da directive "auto-scroll"
                $scope.resetListScrollFlag = new Date().getTime();
            });
        };
        
        $scope.refreshDetail = function (id) {
            if ($stateParams.id == 'novo' || !$scope.selected) {
                $scope.editIntegrator = angular.copy($scope.defaultForm);
                $scope.form.name.$touched = false;
                $scope.form.name.$error.required = false;
            } else {
                $scope.editIntegrator = angular.copy($scope.selected);
                $scope.readOnly = true;
                $location.path('integradores/' + id);
            }
            $scope.resetNewContact();
            $scope.idContactEdit = -1;
        };


        $scope.getListItemIndex = function (id) {
            // Get the list index for auto-scroll function  
            var i = 0;
            for (i = 0; i < $scope.integrators.length; i++) {
                if ($scope.integrators[i].id == id) {
                    break;
                }
            }
            return i;
        };
    
        $scope.new = function () {
            $scope.refreshList();
            $scope.editIntegrator = angular.copy($scope.defaultForm);
            $location.path('integradores/novo');
        };

        $scope.edit = function () {
            $scope.readOnly = false;
        };

        $scope.save = function() {
            if (!$scope.readOnly || $scope.newContactFlag || $scope.idContactEdit > -1) {
                if ($scope.newContactFlag) {
                    if (!$scope.insertNewContact()) {
                        return false;
                    };
                };
                
                if (!$scope.editIntegrator.name && !$scope.editIntegrator.id) {
                    $scope.form.name.$touched = true;
                    return;
                };
                
                $scope.readOnly = true;
                $scope.idContactEdit = -1;

                var id = $scope.editIntegrator.id;
                
                if (id) { // UPDATE
                    for (var i = 0; i < $scope.integrators.length; i++) {
                        if ($scope.integrators[i].id == id) {
                            $scope.selected = angular.copy($scope.editIntegrator);
                            $scope.integrators[i] = $scope.selected;
                            break;
                        }
                    } 
                } else { // INSERT
                    var newId = 0;
                    for (var i = 0; i < $scope.integrators.length; i++) {
                        if ($scope.integrators[i].id > newId) {
                            newId = $scope.integrators[i].id
                        }
                    }
                    newId++;
                    $scope.editIntegrator.id = newId;
                    $scope.selected = angular.copy($scope.editIntegrator);
                    $scope.integrators.push($scope.selected);
                    
                    $scope.activeId = $scope.selected.id;
                    // $scope.searchString = $scope.editIntegrator.name;
                    $location.path('integradores/' + newId);
                    
                    $scope.resetListScroll();
                }
            } else {
                console.log('Nada foi alterado.');
            }        
        };
        
        $scope.delete = function (integratorId) {
            var confirm = $mdDialog.confirm()
                .title('Deseja excluir este integrador?')
                .textContent('O integrador será removido definitivamente.')
                .ariaLabel('Excluir integrador')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancelar');
            
            $mdDialog.show(confirm).then(function() {
                //console.log('Sim');
                IntegratorService.removeIntegrator(integratorId);
                $scope.result.message = "Integrador excluído com sucesso.<br /><br />" + $scope.result.message;
                $scope.refreshList();
            }, function() {
                //console.log('Não');
            });            
        };
        
        
        
        /*
         * #region Contacts
         */
        
        $scope.createNewContact = function () {
            $scope.newContactFlag = true;
            $scope.newContactDefault = {
                name: "",
                email: ""
            };
            $scope.newContact = angular.copy($scope.newContactDefault);
        };

        $scope.insertNewContact = function () {
            if (!$scope.newContact.name || !$scope.newContact.email) {
                //console.log('form error');  
                $scope.form.contact_name.$touched = true;
                $scope.form.contact_email.$touched = true;
                return false;
            };
            var newContactId = 0;
            if ($scope.editIntegrator.contacts.length) {
                for (var i = 0; i < $scope.editIntegrator.contacts.length; i++) {
                    if ($scope.editIntegrator.contacts[i].id > i) {
                        newContactId = $scope.editIntegrator.contacts[i].id;
                    }
                }
            }
            newContactId++;
            var newContact = {id: newContactId, name: $scope.newContact.name, email: $scope.newContact.email };
            $scope.editIntegrator.contacts.push(newContact);
            
            $scope.resetNewContact();
            $scope.contactsOrderBy($scope.orderContactsBy);
            /*
            if ($scope.editIntegrator.id > 0) {
                $scope.save();
            };
            */
            return true;
        };
        
        $scope.resetNewContact = function () {            
            $scope.newContactFlag = false;
            $scope.newContactDefault = {
                name: "name",
                email: "mail@mail"
            };
            $scope.newContact = angular.copy($scope.newContactDefault);              
            $scope.form.contact_name.$setPristine();
            $scope.form.contact_name.$setUntouched();
            $scope.form.contact_email.$setPristine();
            $scope.form.contact_email.$setUntouched();
        };
        
        $scope.editContact = function (contact) {
            $scope.idContactEdit = contact.id;
            $scope.editingContact = angular.copy(contact);
        };
        
        $scope.undoContact = function (contactId) {
            $scope.idContactEdit = -1;
            for (var i = 0; i < $scope.editIntegrator.contacts.length; i++) {
                if ($scope.editIntegrator.contacts[i].id == contactId) {
                    $scope.editIntegrator.contacts[i] = angular.copy($scope.editingContact);
                    $scope.editingContact = {};
                    break;
                };
            };
        };        

        $scope.saveContact = function (contact) {
            $scope.save();
            $scope.contactsOrderBy($scope.orderContactsBy, true);
        };
        
        $scope.removeContact = function (integratorId, contactId, event) {            
            //console.log('removeContact'); 
            var confirm = $mdDialog.confirm()
                .title('Deseja excluir este contato?')
                .textContent('O contato será removido definitivamente.')
                .ariaLabel('Excluir contato')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancelar');
            
            $mdDialog.show(confirm).then(function() {
                //console.log('Sim');
                IntegratorService.removeContact(integratorId, contactId);
                $scope.refreshDetail(integratorId);
            }, function() {
                //console.log('Não');
            });            
        };
        
        $scope.contactsOrderBy = function (orderFieldName, refreshCurrentOrder) {
            if ($scope.orderContactsBy == orderFieldName) {
                $scope.orderContactsDesc = (!$scope.orderContactsDesc && !refreshCurrentOrder);
            } else {
                $scope.orderContactsDesc = false;
                $scope.orderContactsBy = orderFieldName;
            }
        };

        $scope.contactsOrderBy_OLD = function (orderFieldName, refreshCurrentOrder) {
            $timeout(function () {
                //$scope.orderContactsBy = orderFieldName;
                //var desc = false;
                if ($scope.orderContactsBy == orderFieldName) {
                    $scope.orderContactsDesc = (!$scope.orderContactsDesc && !refreshCurrentOrder);
                } else {
                    $scope.orderContactsDesc = false;
                    $scope.orderContactsBy = orderFieldName;
                }
                $scope.orderContactsByIdDesc = false;
                $scope.orderContactsByNameDesc = false;
                $scope.orderContactsByEmailDesc = false;
                switch (orderFieldName) {
                    case 'id':
                        $scope.editIntegrator.contacts.sort(function (a, b) {
                            if ($scope.orderContactsDesc) {
                                $scope.orderContactsByIdDesc = true;
                                return b.id - a.id;
                            } else {
                                $scope.orderContactsByIdDesc = false;
                                return a.id - b.id;
                            }
                        });
                        break;
                    case 'name':
                        $scope.editIntegrator.contacts.sort(function (a, b) {
                            var A = a.name.toUpperCase(); // ignore upper and lowercase
                            var B = b.name.toUpperCase(); // ignore upper and lowercase

                            if ($scope.orderContactsDesc) {
                                $scope.orderContactsByNameDesc = true;
                                return B.localeCompare(A);
                            } else {
                                $scope.orderContactsByNameDesc = false;
                                return A.localeCompare(B);
                            }
                        });
                        break;
                    case 'email':
                        $scope.editIntegrator.contacts.sort(function (a, b) {
                            var A = a.email.toUpperCase(); // ignore upper and lowercase
                            var B = b.email.toUpperCase(); // ignore upper and lowercase

                            if ($scope.orderContactsDesc) {
                                $scope.orderContactsByEmailDesc = true;
                                return B.localeCompare(A);
                            } else {
                                $scope.orderContactsByEmailDesc = false;
                                return A.localeCompare(B);
                            }
                        });
                        break;
                }
            });
        };
        
        /*
         * #endregion Contacts
         */
        
}]);


/*
app.controller('IntegratorsDetailController', ['$scope', '$stateParams', 'IntegratorService', function ($scope, $stateParams, IntegratorService) {
    $scope.selected = IntegratorService.find($stateParams.id)
}]);
*/

app.factory('IntegratorService', function () {
    var integrators = [
        {
            id: 1,
            name: 'Integrador 1',
            description: 'Integrador jhg jkhg kjhg kjhg kjhg kjhg kjhg kjhgjhg kjhg hg .',
            contacts: [
                {
                    id: 1,
                    name: 'João',
                    email: 'joao@integrador1.com'
                },
                {
                    id: 2,
                    name: 'Maria',
                    email: 'maria@integrador1.com'
                }                
            ]
        },
        {
            id: 2,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 3,
            name: 'Integrador 3 (33333)',
            description: 'Integrador (33333) .',
            contacts: [
                {
                    id: 4,
                    name: 'Jurema',
                    email: 'jurema@integrador3.com.br'
                },
                {
                    id: 5,
                    name: 'suporte',
                    email: 'suporte@integrador3.com.br'
                },
                {
                    id: 6,
                    name: 'Admin',
                    email: 'admin@integrador3.com.br'
                }
            ]
        },
        {
            id: 4,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 5,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 6,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 7,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 8,
            name: '2222222222',
            description: 'Integrador 2 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@22222222.com'
                }
            ]
        },
        {
            id: 9,
            name: '999999999',
            description: 'Integrador 9 .',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@999999.com'
                }
            ]
        },
        {
            id: 10,
            name: 'Dez',
            description: 'Novo integrador.',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@dez.com'
                }
            ]
        },
        {
            id: 11,
            name: 'Onze',
            description: 'Outro integrador.',
            contacts: [
                {
                    id: 3,
                    name: 'Pedro',
                    email: 'pedro@mail.com'
                }
            ]
        }
    ];
    
    return {
        list: function () {
            return integrators;
        },
        find: function (id) {
            return _.find(integrators, function (integrator) {
                return integrator.id == id;
            });
        },
        findContact: function (integratorId, contactId) {
            var integrator = _.find(integrators, function (integrator) {
                return integrator.id == integratorId;
            });
            return _.find(integrator.contacts, function (contact) {
                return contact.id == contactId;
            });            
        },
        removeContact: function (integratorId, contactId) {
            var integrator = _.find(integrators, function (integrator) {
                return integrator.id == integratorId;
            });
            var contact = this.findContact(integratorId, contactId);
            var index = integrator.contacts.indexOf(contact);
            integrator.contacts.remove(index);
        },
        removeIntegrator: function (integratorId) {
            var integrator = _.find(integrators, function (integrator) {
                return integrator.id == integratorId;
            });
            var index = integrators.indexOf(integrator);
            integrators.remove(index);
        }
    }
});


function escapeRegExp (string) {
    var result = '';
    if (string !== undefined) {
        result = string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    return result;
}
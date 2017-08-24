angular
    .module('groupsComponent', [])
    .directive('groups', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                group: '=model',
                user: '=member',
            },

            controller: function($scope) {

                function sortGroups(groupsReturned) {
                    if ($scope.user.group && $scope.user.group.list) {
                        let groupList = $scope.user.group.list;

                        Object.keys(groupsReturned).forEach((group) => {
                            let groupId = groupsReturned[group].id;
                            if (groupList[groupId]) {
                                if (groupList[groupId].status === 'accepted') {
                                    groupsReturned[group].joined = '(joined)';
                                } else {
                                    groupsReturned[group].joined = '(request sent)';
                                }

                            }
                        });
                    }

                    $scope.$apply(function() {
                        $scope.allGroups = groupsReturned;
                    });
                }
                $scope.$on('groupsReturned', function(event, groupsReturned) {
                    sortGroups(groupsReturned);
                });
                $scope.$on('user.group', function() {
                    sortGroups($scope.allGroups);
                });

                $scope.findGroup = function(email) {
                    $scope.$emit('retrieveGroups',email);
                }
                $scope.sendMemberRequest = function(group) {
                    let memberRequest = {
                        id: $scope.user.id,
                        name: $scope.user.name,
                        email: $scope.user.email,
                        group: {
                            id: group.id,
                            name: group.name
                        }
                    }
                    $scope.allGroups[group.id].joined = '(request sent)';
                    $scope.$emit('sendMemberRequest', memberRequest);
                }
                $scope.switchGroup = function(group) {
                    if (group) {
                        $scope.user.hideGroup = '';
                        $scope.user.group.active = group;
                    } else {
                        $scope.user.hideGroup = $scope.user.group.active;
                        $scope.user.group.active.id = $scope.user.id;
                    }

                    $scope.$emit('updateUserGroup', $scope.user);
                    //location.reload();
                }
                $scope.removeGroup = function (group) {
                    let groupData = {
                        id: $scope.user.id,
                        name: $scope.user.name,
                        group: {
                            name: group.name,
                            id: group.id
                        }
                    }
                    $scope.$emit('removeMember', groupData);
                }
            },

            templateUrl: 'template/groups.html',
            replace: true
        }
    });
angular
    .module('fromNowComponent', [])
    .filter('fromNow', function() {

        return function(date) {
            console.log('date filter >>>', date);
            return moment(date).fromNow();
        }
    })
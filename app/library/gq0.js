(function(scope) {
    var version = '1.0001';
    var gQ = function(selector, context) {

    };

    gQ.loadJs = function() {

    };

    gQ.version = function() {
        return version;
    };

    if(!scope.gQ) {
        scope.gQ = gQ;
    } else {
        // TBD
    }

}(window));
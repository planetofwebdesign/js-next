(function(scope) {
    var version = '1.0.0.1';
    console.log('My version is '+ version);

    var gq = function(selector, context) {

    };

    gq.loadJs = function() {

    };

    gq.version = function() {
        return version;
    };

    if(!scope.gq) {
        scope.gq = gq;
    } else {
        // TBD
    }

}(window));

(function (scope, isForgiven) {
    var version = '1.0003';
    var doc = scope.document;
    var q;

    var gQ = function (selector, context) {
        return q.query(selector, context);
    };

    gQ.toArray = function (item) {
        var len = item.length;
        var out = [];

        if (len > 0) {
            for (var i = 0; i < len; i++) {
                out[i] = (item[i]);
            }
        } else {
            out[0] = item;
        }
        return out;
    };

    gQ.loadJs = function (path, callback) {
        var js = doc.createElement('script');
        js.src = path;
        js.type = 'text/javascript';
        js.onload = function () {
            callback();
            this.onload = this.onReadyStateChange = null;
        };
        // This is to support really old browsers which does not support onload method
        js.onReadyStateChange = function () {
            if (this.readyState == 'complete') {
                // calling the js.onload method defined earlier
                this.onload();
            }
        };

        doc.getElementsByTagName('head')[0].appendChild(js);
    };

    gQ.ready = function (fun) {
        var last = window.onload;
        var isReady = false;

        if (doc.addEventListener) {
            doc.addEventListener('DOMContentLoaded', function () {
                console.log('DOM is loaded');
                isReady = true;
                fun();
            });
        }

        window.onload = function () {
            if (last) last();
            if (!isReady) fun();
        };
    };
    gQ.start = function () {};
    gQ.version = function () {
        return version;
    };

    gQ.ready(function () {

        if ('jQuery' in scope) {
            q = new JQueryAdapter(scope.jQuery);
            gQ.start();
        } else if (doc.querySelectorAll && doc.querySelectorAll('body:first-of-type')) {
            q = new NativeQuery();
            gQ.start();
        } else {
            gQ.loadJs('./js/sizzle.min.js', function () {
                q = new SizzleAdapter(Sizzle);
                gQ.start();
            });
        }
    });

    NativeQuery = function () {};

    NativeQuery.prototype.query = function (selector, context) {
        context = context || doc;
        return gQ.toArray(context.querySelectorAll(selector));
    };

    SizzleAdapter = function (lib) {
        this.lib = lib;
    };
    SizzleAdapter.prototype.query = function (selector, context) {
        context = context || doc;
        return gQ.toArray(this.lib(selector, context));
    };

    JQueryAdapter = function (lib, context) {
        this.lib = lib;
        this.context = context;
        this.target = lib(context);
    };
    JQueryAdapter.prototype.query = function (selector, context) {
        context = context || doc;
        return this.lib(selector, context).get();
    };

    JQueryAdapter.prototype.text = function (val) {
      return this.target.text(val);
    };

    if (!scope.gQ) {
        scope.gQ = gQ;
    } else {
        if (isForgiven && scope.gQ.version) {
            scope.gQ = scope.gQ.version() > version ? scope.gQ.version : gQ;
        } else {
            throw new Error('One Version is already loaded');
        }
    }
}(window, true));
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

    gQ.ticker = function () {
        return Ticker.getInstance();
    };

    gQ.ready(function () {

        if ('jQuery' in scope) {
            q = QueryFacade.create(JQueryAdapter, scope.jQuery, doc);
            gQ.start();
        } else if (doc.querySelectorAll && doc.querySelectorAll('body:first-of-type')) {
            q = QueryFacade.create(NativeQuery, null, doc);
            gQ.start();
        } else {
            gQ.loadJs('./js/sizzle.min.js', function () {
                q = QueryFacade.create(SizzleAdapter, Sizzle, doc);
                gQ.start();
            });
        }
    });

    QueryFacade = function (adapter) {
        var dom = function () {
                return adapter.context;
            },
            query = function (selector, context) {
                return QueryFacade(adapter.query(selector, context));
            },
            text = function (val) {
                return adapter.text(val);
            };

        return {
            dom: dom,
            query: query,
            text: text
        };

    };

    QueryFacade.create = function (adapter, lib, context) {
        return QueryFacade(new adapter(lib, context));
    };
    // QueryFacade.prototype.dom = function() {
    //     return this.adapter.context;
    // };

    // QueryFacade.prototype.query = function (selector, context) {
    //     return new QueryFacade(this.adapter.query(selector, context));
    // };

    // QueryFacade.prototype.text = function (val) {
    //     return this.adapter.text(val);
    // };

    NativeQuery = function (lib, context) {
        this.context = context;
    };

    NativeQuery.prototype.query = function (selector, context) {
        context = context || this.context;
        return new NativeQuery(gQ.toArray(context.querySelectorAll(selector)));
    };

    NativeQuery.prototype.text = function (val) {
        var innerText = this.context[0].innerText === undefined ? 'textContent' : 'innerText';
        for (var item in this.context) {
            this.context[item][innerText] = val;
        }
        return val;
    };


    SizzleAdapter = function (lib, context) {
        this.lib = lib;
        this.context = context;

    };
    SizzleAdapter.prototype.query = function (selector, context) {
        context = context || doc;
        return new SizzleAdapter(this.lib, gQ.toArray(this.lib(selector, context)));
    };

    SizzleAdapter.prototype.text = function (val) {

        var innerText = this.context[0].innerText === undefined ? 'textContent' : 'innerText';
        for (var item in this.context) {
            this.context[item][innerText] = val;
        }
        return val;
    };

    JQueryAdapter = function (lib, context) {
        this.lib = lib;
        this.context = context;
        this.target = lib(context);
    };
    JQueryAdapter.prototype.query = function (selector, context) {
        context = context || doc;
        return new JQueryAdapter(this.lib, this.lib(selector, context).get());
    };

    JQueryAdapter.prototype.text = function (val) {
        return this.target.text(val);
    };

    var Ticker = (function () {
        var instance;

        function create() {
            // props 
            var intervalId,
                curentInterval = 0,
                index = 0,
                maxInterval = 0,
                sensitivity = 100,
                methods = {},
                api;
            // methods of singlton
            // public methods 
            function add(interval, times, callback, name) {
                var realInterval = interval - interval % sensitivity;
                maxInterval = Math.max(realInterval, maxInterval);
                name = name || (++index);

                if (!methods[realInterval]) {
                    methods[realInterval] = {};
                }
                methods[realInterval][name] = {
                    times: times,
                    callback: callback,
                    interval: interval
                };

                start();

            }
            // private methods 

            function start() {

                if (!intervalId) {
                    intervalId = setInterval(runInterval, sensitivity);
                }

            }

            function runInterval() {
                api.dispatchEvent({
                    type: 'pretick',
                    target: api
                });
                curentInterval = curentInterval % maxInterval;
                curentInterval += sensitivity;

                for (var interval in methods) {
                    if (curentInterval % interval === 0) {
                        processIntervalGroup(methods[interval]);
                    }
                }

                api.dispatchEvent({
                    type: 'tick',
                    target: api
                });
            }

            function processIntervalGroup(group) {
                var item;
                for (var name in group) {
                    item = group[name];
                    item.callback()
                    if (item.times === 0) {
                        delete group[name];
                    } else {
                        --item.times;
                    }
                }
            }

            api = {
                add: add
            };

            EventDispatcher(api);
            return api;
        }

        return {
            getInstance: function () {
                if (!instance) {
                    instance = create();
                }
                return instance;
            }
        };
    })();

    function EventDispatcher(o) {
        var list = {};
        o.addEvent = function (type, listner) {
            if (!list[type]) {
                list[type] = [];
            }
            if (list[type].indexOf(listner) === -1) {
                list[type].push(listner);
            }
        };

        o.dispatchEvent = function (e) {
            var a = list[e.type];
            if (a) {
                if (!e.target) {
                    e.target = this;
                }
                for (var i in a) {
                    a[i](e);
                }
            }
        };
    }



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
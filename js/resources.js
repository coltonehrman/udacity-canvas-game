(function() {

    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    function load(urlOrArr) {
        if (urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if (resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;
                if ( isReady() ) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if (resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
              ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

    window.getRandom = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    window.range = function(num, callback) {
        for (var i = 0; i < num; i++) {
            callback();
        }
    };

}());

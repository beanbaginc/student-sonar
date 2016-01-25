const memjs = require('memjs'),
      Q = require('q');

module.exports = function(config) {
    let cache = null;

    if (config.memcachedServers) {
        cache = memjs.Client.create(config.memcachedServers, {
            username: config.memcachedUsername,
            password: config.memcachedPassword
        });
    }

    function memoize(fn, key, options) {
        options = options || {};

        if (cache === null) {
            return fn();
        } else {
            const deferred = Q.defer();

            cache.get(key, function(err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                if (data) {
                    if (options.json) {
                        data = JSON.parse(data.toString());
                    }

                    deferred.resolve(data);
                } else {
                    fn()
                    .then(function(data) {
                        const toStore = options.json ? JSON.stringify(data) : data;

                        cache.set(key, toStore, function(err, val) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                deferred.resolve(data);
                            }
                        }, options.duration || 300);
                    })
                    .catch(deferred.reject.bind(deferred));
                }
            });

            return deferred.promise;
        }
    }

    return {
        memoize: memoize
    };
};

import memjs from 'memjs';


export default function(config) {
    let cache = null;

    if (config.memcachedServers) {
        cache = memjs.Client.create(config.memcachedServers, {
            username: config.memcachedUsername,
            password: config.memcachedPassword,
        });
    }

    this.memoize = (fn, key, options={}) => {
        if (cache === null) {
            return fn();
        }

        return cache.get(key)
            .then(data => {
                if (data) {
                    try {
                        return options.json ? JSON.parse(data.toString()) : data;
                    } catch (e) {
                        // Something went wrong. Run `fn` again.
                    }
                }

                return fn().then(data => {
                    const toStore = options.json ? JSON.stringify(data) : data;

                    return cache.set(key, toStore, options.duration || 300)
                        .then(() => data);
                });
            });
    };
}

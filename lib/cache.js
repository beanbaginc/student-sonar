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
            .then(({ value }) => {
                if (value) {
                    try {
                        return options.json ? JSON.parse(value.toString()) : value.toString();
                    } catch (e) {
                        console.log('Error decoding cached data', e);
                        // Something went wrong. Run `fn` again.
                    }
                }

                return fn().then(data => {
                    return cache.set(
                        key,
                        options.json ? JSON.stringify(data) : data,
                        {
                            expires: options.duration || 300,
                        })
                        .then(() => data);
                });
            });
    };
}

import Sequelize from 'sequelize';

import loadConfig from './config';
import schema from './schema';


function initConfig() {
    return loadConfig().then(config => {
        return { config };
    });
}


async function initSequelize(options) {
    const dbOptions = {};

    if (process.env.NODE_ENV === 'production') {
        dbOptions.logging = false;
    } else {
        dbOptions.logging = false;
        dbOptions.dialectOptions = {
            ssl: {
                rejectUnauthorized: false,
            },
        };
    }

    options.sequelize = new Sequelize(options.config.databaseURL, dbOptions);

    try {
        await options.sequelize.authenticate();
        console.log('Connected to Postgres at %s', options.config.databaseURL);

        schema.initSequelize(options);
    } catch (error) {
        console.error('Unable to connect to Postgres:', error);
        throw error;
    }

    return options;
}


export default function() {
    return initConfig()
        .then(initSequelize)
}

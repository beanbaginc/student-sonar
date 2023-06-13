import Sequelize from 'sequelize';

import loadConfig from './config.js';
import schema from './schema.js';


async function initConfig(options) {
    options.config = await loadConfig();
}


async function initSequelize(options) {
    options.sequelize = new Sequelize(options.config.databaseURL, {
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });

    try {
        await options.sequelize.authenticate();
        console.log('Connected to Postgres at %s', options.config.databaseURL);

        schema.initSequelize(options);
    } catch (error) {
        console.error('Unable to connect to Postgres:', error);
        throw error;
    }
}


export default async function() {
    const options = {};

    await initConfig(options);
    await initSequelize(options);

    return options;
}

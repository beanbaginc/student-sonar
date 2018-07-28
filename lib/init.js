import mongoose from 'mongoose';

import loadConfig from './config';
import schema from './schema';


function initConfig() {
    return loadConfig().then(config => {
        return { config };
    });
}

function initMongodb(options) {
    let db = null;

    const connect = new Promise((resolve, reject) => {
        mongoose.connect(options.config.mongodbURI, { useNewUrlParser: true });
        db = mongoose.connection;

        db.on('error', reject);
        db.on('open', resolve);
    });

    return connect.then(() => {
        console.log('Connected to MongoDB at %s', options.config.mongodbURI);

        schema.init(mongoose);

        options.db = db;
        return options;
    });
}


export default function() {
    return initConfig().then(initMongodb);
}

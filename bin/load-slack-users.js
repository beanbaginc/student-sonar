import init from '../lib/init';
import schema from '../lib/schema';
import Slack from '../lib/slack';

function updateUser(user) {
    return new Promise((resolve, reject) => {
        if (user.is_bot) {
            resolve();
        } else {
            console.log('Saving data for %s (%s - %s)',
                        user.profile.real_name_normalized, user.name, user.id);

            try {
                let query = schema.User.findOneAndUpdate(
                    { slack_user_id: user.id },
                    {
                        email: user.profile.email,
                        slack_user_id: user.id,
                        slack_username: user.name,
                        name: user.profile.real_name_normalized,
                        avatar: user.profile.image_192,
                        timezone: user.tz
                    },
                    { upsert: true },
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
            } catch(e) {
                reject(e);
            }
        }
    });
}

init()
    .then(options => {
        const slack = new Slack(options.config);

        return slack.getUsers()
            .then(users => Promise.all(users.members.map(updateUser)));
    })
    .then(process.exit)
    .catch(console.error.bind(console));

import init from '../lib/init';
import schema from '../lib/schema';
import Slack from '../lib/slack';

function updateUser(user) {
    if (user.is_bot || user.id === 'USLACKBOT') {
        return Promise.resolve();
    }

    console.log('Saving data for %s (%s - %s)',
                user.profile.real_name_normalized, user.name, user.id);

    return schema.sql.User.upsert({
        avatar: user.profile.image_192,
        email: user.profile.email,
        name: user.profile.real_name_normalized,
        slackUserId: user.id,
        slackUsername: user.name,
        timezone: user.tz,
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

function init(mongoose) {
    module.exports.User = mongoose.model(
        'User',
        new mongoose.Schema({
            avatar: String,
            demos: [{
                text: String,
                href: String,
                color: String
            }],
            email: String,
            groups: [String],
            name: String,
            projects: [{
                text: String,
                href: String
            }],
            rb_username: String,
            school: String,
            slack_access_token: String,
            slack_user_id: String,
            slack_username: String,
            status_reports: [{
                text: String,
                href: String,
                color: String
            }],
            timezone: String
        }));

    module.exports.CalendarEntry = mongoose.model(
        'CalendarEntry',
        new mongoose.Schema({
            date: Date,
            show_to_groups: [String],
            summary: String
        }));
}

module.exports = {
    init: init
};
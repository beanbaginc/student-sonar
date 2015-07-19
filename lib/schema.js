function init(mongoose) {
    function requireAdmin(user) {
        return user.isAdmin();
    }

    function disable() {
        return false;
    }

    const userSchema = new mongoose.Schema({
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
            // Old-style
            text: String,
            href: String,
            color: String,

            // New-style
            date_due: Date,
            date_submitted: Date,
            sections: [{
                title: String,
                contents: String
            }]
        }],
        timezone: String
    });

    userSchema.methods.isAdmin = function() {
        return this.groups.indexOf('mentors') !== -1;
    };

    userSchema.methods.canCreate = disable;
    userSchema.methods.canDelete = disable;
    userSchema.methods.canUpdate = requireAdmin;

    module.exports.User = mongoose.model('User', userSchema);

    const statusReportDueDateSchema = new mongoose.Schema({
        date: Date,
        show_to_groups: [String]
    });

    statusReportDueDateSchema.canCreate = requireAdmin;
    statusReportDueDateSchema.canDelete = requireAdmin;
    statusReportDueDateSchema.canUpdate = requireAdmin;

    module.exports.StatusReportDueDate = mongoose.model(
        'StatusReportDueDate', statusReportDueDateSchema);

    const calendarEntrySchema = new mongoose.Schema({
        date: Date,
        show_to_groups: [String],
        summary: String
    });

    calendarEntrySchema.methods.canCreate = requireAdmin;
    calendarEntrySchema.methods.canDelete = requireAdmin;
    calendarEntrySchema.methods.canUpdate = requireAdmin;

    module.exports.CalendarEntry = mongoose.model('CalendarEntry',
                                                  calendarEntrySchema);

    const groupSchema = new mongoose.Schema({
        group_id: String,
        name: String,
        show: Boolean
    });

    groupSchema.methods.canCreate = requireAdmin;
    groupSchema.methods.canDelete = requireAdmin;
    groupSchema.methods.canUpdate = requireAdmin;

    module.exports.Group = mongoose.model('Group', groupSchema);
}

module.exports = {
    init: init
};

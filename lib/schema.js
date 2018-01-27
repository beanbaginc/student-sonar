function init(mongoose) {
    const requireMentor = user => (user.type === 'mentor');
    const disable = () => false;

    const userSchema = new mongoose.Schema({
        avatar: String,
        demos: [{
            text: String,
            href: String,
            color: String,
        }],
        email: String,
        groups: [String],
        name: String,
        notes: String,
        primary_mentor: mongoose.Schema.Types.ObjectId, // "Foreign key" to User
        projects: [{
            text: String,
            href: String,
        }],
        rb_username: String,
        school: String,
        slack_access_token: String,
        slack_user_id: String,
        slack_username: String,
        status_reports: [{
            // These are old-style status reports. For the new ones, see the
            // StatusReport model.
            text: String,
            href: String,
            color: String,
        }],
        timezone: String,
        type: {
            type: String,
            enum: [
                'student',
                'mentor',
                'instructor',
            ],
            default: 'student'
        }
    });

    userSchema.methods.canCreate = disable;
    userSchema.methods.canDelete = disable;
    userSchema.methods.canUpdate = requireMentor;

    module.exports.User = mongoose.model('User', userSchema);

    const statusReportDueDateSchema = new mongoose.Schema({
        date: Date,
        show_to_groups: [String],
    });

    statusReportDueDateSchema.canCreate = requireMentor;
    statusReportDueDateSchema.canDelete = requireMentor;
    statusReportDueDateSchema.canUpdate = requireMentor;

    module.exports.StatusReportDueDate = mongoose.model(
        'StatusReportDueDate', statusReportDueDateSchema);

    const statusReportSchema = new mongoose.Schema({
        date_due: mongoose.Schema.Types.ObjectId, // "Foreign key" to User
        date_submitted: Date,
        text: String,
        user: mongoose.Schema.Types.ObjectId, // "Foreign key" to StatusReportDueDate
    });

    module.exports.StatusReport = mongoose.model(
        'StatusReport', statusReportSchema);

    const calendarEntrySchema = new mongoose.Schema({
        date: Date,
        show_to_groups: [String],
        summary: String,
    });

    calendarEntrySchema.methods.canCreate = requireMentor;
    calendarEntrySchema.methods.canDelete = requireMentor;
    calendarEntrySchema.methods.canUpdate = requireMentor;

    module.exports.CalendarEntry = mongoose.model('CalendarEntry',
                                                  calendarEntrySchema);

    const groupSchema = new mongoose.Schema({
        group_id: String,
        name: String,
        show: Boolean,
    });

    groupSchema.methods.canCreate = requireMentor;
    groupSchema.methods.canDelete = requireMentor;
    groupSchema.methods.canUpdate = requireMentor;

    module.exports.Group = mongoose.model('Group', groupSchema);
}


module.exports = {
    init: init,
};

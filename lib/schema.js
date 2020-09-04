import { DataTypes, Model } from 'sequelize';


function initSequelize(options) {
    const sequelize = options.sequelize;

    const Group = sequelize.define('Group', {
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        groupId: DataTypes.STRING,
        name: DataTypes.STRING,
        showInSidebar: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    const StatusReportDueDate = sequelize.define('StatusReportDueDate', {
        date: DataTypes.DATEONLY,
    });

    const StatusReport = sequelize.define('StatusReport', {
        dateSubmitted: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        text: DataTypes.TEXT,
    });

    const User = sequelize.define('User', {
        avatar: DataTypes.STRING,
        demos: DataTypes.JSON,
        email: DataTypes.STRING,
        name: DataTypes.STRING,
        notes: DataTypes.TEXT,
        rbUsername: DataTypes.STRING,
        school: DataTypes.STRING,
        slackAccessToken: DataTypes.STRING,
        slackUserId: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        slackUsername: DataTypes.STRING,
        timezone: DataTypes.STRING,
        type: {
            type: DataTypes.ENUM,
            values: ['student', 'mentor', 'instructor'],
            defaultValue: 'student',
        },

        legacyProjects: DataTypes.JSON,
        legacyStatusReports: DataTypes.JSON,
    });

    // Many-to-many relationship between users and groups.
    Group.belongsToMany(User, { through: 'UserGroups' });
    User.belongsToMany(Group, { through: 'UserGroups' });

    // Many-to-many relationship between groups and status report due dates.
    StatusReportDueDate.belongsToMany(Group, { through: 'StatusReportDueDateGroups' });
    Group.belongsToMany(StatusReportDueDate, { through: 'StatusReportDueDateGroups' });

    // One-to-many relationship between a status report due date and status
    // reports.
    StatusReport.belongsTo(StatusReportDueDate);
    StatusReportDueDate.hasMany(StatusReport);

    // One-to-many relationship between a user and status reports.
    StatusReport.belongsTo(User);
    User.hasMany(StatusReport);

    // Assigned mentor one-to-one relationship
    User.belongsTo(User, {
        as: 'assignedMentor',
        foreignKey: 'assignedMentorId',
    });
    User.hasMany(User, {
        as: 'assignedStudents',
        foreignKey: 'assignedMentorId',
    });

    module.exports.sql = {
        Group,
        StatusReportDueDate,
        StatusReport,
        User,
    };
}


module.exports = {
    initSequelize: initSequelize,
};

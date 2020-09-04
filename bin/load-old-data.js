import fs from 'fs';

import init from '../lib/init';
import schema from '../lib/schema';


init()
    .then(async options => {
        await options.sequelize.drop({});
        await options.sequelize.sync();

        const Group = schema.sql.Group;
        const User = schema.sql.User;
        const StatusReportDueDate = schema.sql.StatusReportDueDate;
        const StatusReport = schema.sql.StatusReport;

        const groups = JSON.parse(fs.readFileSync('groups.json'));
        const groupsByMongoId = {};
        const groupsById = {};

        for (let group of groups) {
            console.log('Migrating group %s', group.name);

            const newGroup = await Group.create({
                active: !!group.show,
                groupId: group.group_id,
                name: group.name,
                showInSidebar: !!group.show_in_sidebar,
            });
            groupsByMongoId[group._id.$oid] = newGroup;
            groupsById[group.group_id] = newGroup;
        }

        const users = JSON.parse(fs.readFileSync('users.json'));
        const usersByMongoId = {};

        for (let user of users) {
            if (!user.slack_username) {
                console.log('Skipping user %s (%s)',
                            user.name, user.slack_user_id);
                continue;
            }

            console.log('Migrating user %s (%s)',
                        user.name, user.slack_user_id);

            const newUser = await User.create({
                avatar: user.avatar,
                demos: user.demos,
                email: user.email,
                name: user.name,
                notes: user.notes,
                rbUsername: user.rb_username,
                school: user.school,
                slackAccessToken: user.slack_access_token,
                slackUserId: user.slack_user_id,
                slackUsername: user.slack_username,
                timezone: user.timezone,
                type: user.type,

                legacyStatusReports: user.status_reports,
                legacyProjects: user.projects,
            });
            usersByMongoId[user._id.$oid] = newUser;

            if (user.groups) {
                const userGroups = user.groups.map(id => groupsById[id]).filter(group => group !== undefined);
                await newUser.addGroups(userGroups);
            }
        }

        for (let user of users) {
            if (user.primary_mentor) {
                const newUser = usersByMongoId[user._id.$oid];
                const mentor = usersByMongoId[user.primary_mentor.$oid];

                await newUser.setAssignedMentor(mentor);
            }
        }

        console.log('Migrating status report due dates...');

        const dueDates = JSON.parse(fs.readFileSync('statusreportduedates.json'));
        const dueDatesByMongoId = {};

        for (let dueDate of dueDates) {
            const newDueDate = await StatusReportDueDate.create({
                date: new Date(parseInt(dueDate.date.$date.$numberLong, 10)),
            });

            dueDatesByMongoId[dueDate._id.$oid] = newDueDate;

            if (dueDate.show_to_groups) {
                const dueDateGroups = dueDate.show_to_groups.map(id => groupsById[id]).filter(group => group !== undefined);
                await newDueDate.addGroups(dueDateGroups);
            }
        }

        console.log('Migrating status reports...');

        const statusReports = JSON.parse(fs.readFileSync('statusreports.json'));

        for (let report of statusReports) {
            try {
                let dateSubmitted = null;

                if (report.date_submitted) {
                    if (report.date_submitted.$date) {
                        dateSubmitted = new Date(parseInt(report.date_submitted.$date.$numberLong, 10));
                    } else {
                        dateSubmitted = new Date(report.date_submitted);
                    }
                }

                const newStatusReport = await StatusReport.create({
                    dateSubmitted: dateSubmitted,
                    text: report.text,
                });
                await newStatusReport.setStatusReportDueDate(dueDatesByMongoId[report.date_due.$oid]);
                await newStatusReport.setUser(usersByMongoId[report.user.$oid]);
            } catch (error) {
                console.dir(error);
                console.dir(report);
                return;
            }
        }
    })
    .then(process.exit)
    .catch(console.error.bind(console));

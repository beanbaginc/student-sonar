import asana from 'asana';


function parseTask(task, projectID) {
    const html = task.html_notes.split('\n').map(line => {
        // Sometimes Asana has a list tag per item, when copy/pasting.
        line = line.replace(/(<\/UL><UL>|<\/OL><OL>)/gi, '');

        if (line[0] !== '<') {
            return `<p>${line}</p>`;
        } else {
            return line;
        }
    }).join('\n');

    let section = null;
    for (let membership of task.memberships) {
        if (membership.project.gid === projectID &&
            membership.section !== null) {
            section = membership.section.name;
            break;
        }
    }

    return {
        assignee: task.assignee && task.assignee.email,
        completed: !!task.completed,
        html: html,
        id: task.gid,
        memberships: task.memberships,
        name: task.name,
        projects: task.projects.map(project => project.name).sort(),
        section: section,
        tags: task.tags.map(tag => tag.name).sort()
    };
}


async function getTaskByID(projectID, client, taskID) {
    const task = await client.tasks.findById(taskID, { opt_expand: '(this|html_notes|assignee)' });
    return parseTask(task, projectID);
}


async function getTasks(projectID, client) {
    const collection = await client.tasks.findByProject(projectID, { opt_expand: '(this|html_notes|assignee)' });
    const tasks = await collection.fetch();

    return tasks
        .filter(task => !task.name.endsWith(':'))
        .map(task => parseTask(task, projectID));
}


async function getTasksBySection(projectID, client) {
    const collection = await client.tasks.findByProject(projectID, { opt_expand: '(this|html_notes|assignee)' });
    const tasks = await collection.fetch();

    const sections = {};

    tasks.forEach(task => {
        if (task.name.endsWith(':')) {
            return;
        }

        task = parseTask(task, projectID);

        for (let membership of task.memberships) {
            if (membership.project.gid === projectID &&
                membership.section !== null) {
                const name = membership.section.name;

                if (!sections.hasOwnProperty(name)) {
                    sections[name] = {
                        id: membership.section.gid,
                        tasks: []
                    };
                }

                sections[name].tasks.push(task);
            }
        }
    });

    return sections;
}


async function getTasksByAssignee(projectID, client, assignee) {
    const tasks = await getTasks(projectID, client);
    return tasks.filter(task => task.assignee == assignee);
}


export default function(config) {
    const projectID = config.asanaStudentProjectsID;
    const client = asana.Client.create().useAccessToken(config.asanaAccessToken);

    this.getTaskByID = getTaskByID.bind(this, projectID, client);
    this.getTasks = getTasks.bind(this, projectID, client);
    this.getTasksBySection = getTasksBySection.bind(this, projectID, client);
    this.getTasksByAssignee = getTasksByAssignee.bind(this, projectID, client);
}

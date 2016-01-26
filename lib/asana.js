const asana = require('asana');

function parseTask(task) {
    const html = task.html_notes.split('\n').map(line => {
        // Sometimes Asana has a list tag per item, when copy/pasting.
        line = line.replace(/(<\/UL><UL>|<\/OL><OL>)/gi, '');

        if (line[0] !== '<') {
            return `<p>${line}</p>`;
        } else {
            return line;
        }
    }).join('\n');

    return {
        assignee_email: task.assignee && task.assignee.email,
        completed: !!task.completed,
        html: html,
        id: task.id,
        memberships: task.memberships,
        name: task.name,
        projects: task.projects.map(project => project.name).sort(),
        tags: task.tags.map(tag => tag.name).sort()
    };
}

function getTasks(config, projectID, client) {
    return client.tasks.findByProject(projectID, {
        workspace: parseInt(config.asanaWorkspaceID, 10),
        opt_expand: '(this|html_notes|assignee)'
    })
    .then(collection => collection.fetch())
    .then(function(tasks) {
        const sections = {};

        tasks.forEach(task => {
            if (task.name.endsWith(':')) {
                return;
            }

            task = parseTask(task);

            for (let membership of task.memberships) {
                if (membership.project.id === projectID) {
                    let name = membership.section.name;
                    name = name.substr(0, name.length - 1);

                    if (!sections.hasOwnProperty(name)) {
                        sections[name] = {
                            id: membership.section.id,
                            tasks: []
                        };
                    }

                    sections[name].tasks.push(task);
                }
            }
        });

        return sections;
    });
}

module.exports = function(config) {
    const projectID = parseInt(config.asanaStudentProjectsID, 10),
          client = asana.Client.create().useBasicAuth(config.asanaAPIKey);

    return {
        getTasks: getTasks.bind(this, config, projectID, client)
    };
};
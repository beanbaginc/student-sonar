import ReadyView from './ready-view';
import TaskView from './task-view';


export default class StudentProjectView extends ReadyView {
    constructor(options) {
        options = Object.create(options);
        options.className = 'student-projects';
        super(options);

        this.taskID = options.taskID;

        this.model.get('projects').fetch().then(() => this.render());
    }

    _render() {
        let task;

        this.model.get('projects').each(section => {
            const t = section.get('tasks').get(this.taskID);
            if (t) {
                task = t;
            }
        });

        if (task) {
            const view = new TaskView({
                model: task
            });

            this.$el
                .empty();

            $('<div id="ideas" class="content-inner"/>')
                .append(view.render().el)
                .appendTo(this.$el);
        }
    }
}

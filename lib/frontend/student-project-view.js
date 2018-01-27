// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';

import Project from './project';
import ReadyView from './ready-view';


export default class StudentProjectView extends ReadyView {
    constructor(options) {
        options = Object.create(options);
        options.className = 'student-projects';
        super(options);

        this.taskID = options.taskID;

        this.model.get('projects').fetch().then(() => this.render());
    }

    _render() {
        let task = null;

        this.model.get('projects').each(section => {
            const t = section.get('tasks').get(this.taskID);
            if (t) {
                task = t;
            }
        });

        if (task) {
            ReactDOM.render(
                <div id="ideas" className="content-inner">
                    <Project {...task.attributes}>{task.attributes.html}</Project>
                </div>,
                this.$el[0]);
        }
    }
}

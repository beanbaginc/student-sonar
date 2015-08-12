import Backbone from 'backbone';


/*
 * ReadyView is an abstract base class for views that want to wait to render
 * their contents until the application is "ready" (i.e. all the data has been
 * fetched from the server).
 *
 * Subclasses should implement a _render() function rather than render().
 */
export default class ReadyView extends Backbone.View {
    constructor(options) {
        super(options);

        const app = window.application;
        this._ready = app.get('ready');
        this._rendered = false;
        this.listenTo(app, 'ready', this._onReady);
    }

    render() {
        this._rendered = true;

        if (this._ready) {
            this._render();
        }

        return this;
    }

    _onReady() {
        this._ready = true;

        if (this._rendered) {
            this.render();
        }
    }
}

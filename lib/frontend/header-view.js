import _ from 'underscore';
import Backbone from 'backbone';
import 'bootstrap-toggle';


/*
 * HeaderView wraps the site header containing various navigation links.
 */
export default class HeaderView extends Backbone.View {
    constructor(options) {
        options.tagName = 'nav';
        options.className = 'navbar navbar-default navbar-fixed-top';
        super(options);

        this._template = _.template(`
            <div class="container-fluid">
                <a class="navbar-brand" id="root-link" href="/">Student Sonar</a>

                <div class="collapse navbar-collapse navbar-right">
                    <ul class="nav navbar-nav">
                        <% if (isAdmin) { %>
                            <li><input type="checkbox" id="manage-toggle"
                                       <% if (manage) { %>checked<% } %>/></li>
                        <% } %>
                        <% if (userId === null) { %>
                            <li><a href="/login">Log in</a></li>
                        <% } else { %>
                            <li><a href="/logout">Log out</a></li>
                        <% } %>
                    </ul>
                </div>
            </div>
            `);
    }

    render() {
        this.$el.html(this._template(_.defaults({
            userId: window.userId,
            isAdmin: window.isAdmin
        }, this.model.attributes)));

        this.$('#manage-toggle')
            .bootstrapToggle({
                on: 'Manage',
                off: 'Manage',
                size: 'small'
            })
            .change((ev) => this.model.set('manage', $(ev.target).prop('checked')));
        return this;
    }
}

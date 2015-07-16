import _ from 'underscore';
import Backbone from 'backbone';


/*
 * HeaderView wraps the site header containing various navigation links.
 */
export default class HeaderView extends Backbone.View {
    constructor(options) {
        options.tagName = 'header';
        options.id = 'header';
        super(options);

        this._template = _.template(`
            <div>
                <img src="<%= avatar %>" width="36" height="36">
                <%= name %>
            </div>

            <nav>
                <ul>
                    <% if (isAdmin) { %>
                        <li><a id="admin-link" href="/admin">Admin</a></li>
                    <% } %>
                    <li><a href="/logout">Log out</a></li>
                </ul>
            </nav>
            `);
    }

    events() {
        return {
            'click #admin-link': '_onAdminClicked'
        };
    }

    render() {
        this.$el.html(this._template(_.defaults({
            isAdmin: window.isAdmin
        }, this.model.attributes)));
        return this;
    }

    _onAdminClicked() {
        this.trigger('go-admin');
        return false;
    }
}

import moment from 'moment';


export default function() {
    let proto = Object.create(HTMLOListElement.prototype);
    let tagName = 'x-event-list';
    let cssAdded = false;

    proto.createdCallback = function() {
        let template = document.getElementById(tagName + '-template');
        let clone = document.importNode(template.content, true);

        if (Platform.ShadowCSS && !cssAdded) {
            let style = clone.querySelector('style');
            let cssText = Platform.ShadowCSS.shimCssText(style.textContent, tagName);
            Platform.ShadowCSS.addCssToDocument(cssText);
            cssAdded = true;
        }

        this.createShadowRoot().appendChild(clone);
    };

    proto.getDay = function(date) {
        let reversed = this.attributes.getNamedItem('reversed') !== null;
        let m = moment(date).startOf('day');
        let day;
        let next;

        for (let i = 0; i < this.children.length; i++) {
            let child = this.children.item(i);

            if (m.isSame(child.moment)) {
                day = child;
                break;
            }

            if ((!reversed && m.isBefore(child.moment)) ||
                (reversed && m.isAfter(child.moment))) {
                next = child;
                break;
            }
        }

        if (day === undefined) {
            day = document.createElement('x-event-day');
            day.setAttribute('date', m.format('YYYY-MM-DDT'));

            if (next) {
                day = this.insertBefore(day, next);
            } else {
                this.appendChild(day);
            }
        }

        return day;
    };

    window.XEventList = document.registerElement(tagName, {prototype: proto});
}

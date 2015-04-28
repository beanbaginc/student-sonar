import moment from 'moment';


export default function() {
    let proto = Object.create(HTMLLIElement.prototype);
    let tagName = 'x-event-day';
    let cssAdded = false;

    proto.setAttribute = function(attribute, value) {
        if (attribute === 'date') {
            this.moment = moment(value);

            this.shadowRoot.querySelector('#date').textContent = this.moment.format('ddd, MMM D');
        }
    };

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

    proto.attachedCallback = function() {
        let attributes = Array.prototype.slice.call(this.attributes);
        attributes.forEach(attr => this.setAttribute(attr.name, attr.value));
    };

    proto.attributeChangedCallback = function(attribute, oldValue, newValue) {
        this.setAttribute(attribute, newValue);
    };

    window.XEventDay = document.registerElement(tagName, {prototype: proto});
}

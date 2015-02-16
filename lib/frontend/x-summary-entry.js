export default function() {
    let proto = Object.create(HTMLElement.prototype);
    let tagName = 'x-summary-entry';
    let cssAdded = false;

    proto.setAttribute = function(attribute, value) {
        if (attribute === 'title') {
            this.shadowRoot.getElementById('title').textContent = value;
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

    window.XStudentViewSummaryEntry = document.registerElement(tagName, {prototype: proto});
}

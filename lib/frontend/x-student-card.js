export default function() {
    let proto = Object.create(HTMLElement.prototype);
    let tagName = 'x-student-card';
    let cssAdded = false;

    proto.setAttribute = function(attribute, value) {
        if (attribute === 'student') {
            let student = JSON.parse(value);
            this.shadowRoot.getElementById('avatar').src = student.avatar;
            this.shadowRoot.getElementById('name').textContent = student.name;
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

    window.XStudentCardElement = document.registerElement(tagName, {prototype: proto});
}

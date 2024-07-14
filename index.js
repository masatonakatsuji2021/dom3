class VDCData {
    static uniqId() {
        const lbn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let str = "";
        for (let n = 0; n < 32; n++) {
            const word = lbn[Math.round(Math.random() * 1000) % lbn.length];
            str += word;
        }
        return str;
    }
    static searchSelector(selector, targetEls) {
        let buffer;
        let els = [];
        if (typeof selector == "string") {
            // selector is string...
            if (targetEls) {
                targetEls.forEach((el) => {
                    let subEls = el.querySelectorAll("[v=\"" + selector + "\"]");
                    subEls.forEach((subEl) => {
                        els.push(subEl);
                    });
                });
            }
            else {
                els = Object.values(document.querySelectorAll("[v=\"" + selector + "\"]"));
            }
            if (els.length) {
                els.forEach((el) => {
                    el.removeAttribute("v");
                });
            }
        }
        else {
            // selector is HTMLElements...
            els = selector;
        }
        buffer = {
            id: this.uniqId(),
            elements: els,
            data: {},
        };
        if (typeof selector == "string")
            buffer.selector = selector;
        this.buffers[buffer.id] = buffer;
        return buffer;
    }
    static create() {
        const element = document.createElement("div");
        let buffer = {
            id: this.uniqId(),
            elements: [element],
            data: {},
        };
        this.buffers[buffer.id] = buffer;
        return buffer;
    }
    static addEvent(id, event, handler) {
        if (!this.buffers[id][event])
            this.buffers[id][event] = [];
        this.buffers[id][event].push(handler);
    }
    static refresh() {
        const c = Object.keys(this.buffers);
        for (let n = 0; n < c.length; n++) {
            const id = c[n];
            const buffer = this.buffers[id];
            buffer.elements.forEach((el, index) => {
                const exists = document.body.contains(el);
                if (!exists) {
                    buffer.elements.splice(index, 1);
                }
            });
            if (!buffer.elements.length) {
                delete this.buffers[id];
            }
        }
    }
}
VDCData.buffers = {};
class VirtualDomControl {
    constructor(selector, targetEls) {
        let buffer;
        if (selector) {
            buffer = VDCData.searchSelector(selector, targetEls);
        }
        else {
            buffer = VDCData.create();
        }
        this.id = buffer.id;
    }
    static create(htmlContent) {
        const res = new VirtualDomControl();
        if (htmlContent)
            res.html = htmlContent;
        return res;
    }
    create() {
        const res = new VirtualDomControl();
        res.html = this.html;
        return res;
    }
    static refresh() {
        VDCData.refresh();
    }
    /**
     * ***find*** :
     * @param selector ]
     * @returns
     */
    find(selector) {
        return new VirtualDomControl(selector, this.elements);
    }
    /**
     * ***fildAll*** :
     * @returns
     */
    findAll(selectors) {
        let result = {};
        this.searchEl((el) => {
            const childEls = el.querySelectorAll("[v]");
            childEls.forEach((el2) => {
                const vname = el2.attributes["v"].value;
                const vdc = new VirtualDomControl(vname, this.elements);
                result[vname] = vdc;
            });
        });
        return result;
    }
    index(index) {
        const els = [this.elements[index]];
        return new VirtualDomControl(els);
    }
    get elements() {
        if (!VDCData.buffers[this.id])
            return;
        return VDCData.buffers[this.id].elements;
    }
    get length() {
        return this.elements.length;
    }
    get elFirst() {
        return this.elements[0];
    }
    get elLast() {
        return this.elements[this.elements.length - 1];
    }
    searchEl(handle) {
        this.elements.forEach(handle);
    }
    get first() {
        const els = [this.elFirst];
        return new VirtualDomControl(els);
    }
    get last() {
        const els = [this.elLast];
        return new VirtualDomControl(els);
    }
    get html() {
        return this.elFirst.innerHTML;
    }
    set html(content) {
        this.searchEl((el) => {
            if (el.childNodes.length) {
                el.childNodes.forEach((cel) => {
                    el.removeChild(cel);
                });
            }
            el.innerHTML = content;
        });
    }
    get outerHtml() {
        return this.elFirst.outerHTML;
    }
    get text() {
        return this.elFirst.innerText;
    }
    set text(content) {
        this.searchEl((el) => {
            if (el.childNodes.length) {
                el.childNodes.forEach((cel) => {
                    el.removeChild(cel);
                });
            }
            el.innerText = content;
        });
    }
    clear() {
        this.html = "aaa";
        return this;
    }
    add(content, position) {
        if (!position)
            position = "beforeend";
        this.searchEl((el) => {
            if (typeof content == "string") {
                el.insertAdjacentHTML(position, content);
            }
            else {
                content.elements.forEach((el2) => {
                    if (position == "beforeend") {
                        el.append(el2);
                    }
                    else if (position == "beforebegin") {
                        el.before(el2);
                    }
                    else if (position == "afterend") {
                        el.after(el2);
                    }
                });
            }
        });
        return this;
    }
    remove() {
        this.searchEl((el) => {
            el.remove();
        });
        VDCData.refresh();
        console.log(VDCData.buffers);
    }
    on(event, listener) {
        this.searchEl((el) => {
            el.addEventListener(event, listener);
        });
        VDCData.addEvent(this.id, event, listener);
        return this;
    }
    set onClick(listener) {
        this.on("click", listener);
    }
    set onFocus(listener) {
        this.on("focus", listener);
    }
    set onChange(listener) {
        this.on("change", listener);
    }
    set onDblclick(listener) {
        this.on("dblclick", listener);
    }
    data(name, value) {
        if (value) {
            VDCData.buffers[this.id].data[name] = value;
            return this;
        }
        else {
            return VDCData.buffers[this.id].data[name];
        }
    }
    removeData(name) {
        delete VDCData.buffers[this.id].data[name];
        return this;
    }
    attr(name, value) {
        if (value) {
            this.searchEl((el) => {
                value = value.toString();
                el.setAttribute(name, value);
            });
        }
        else {
            const attr = this.elFirst.attributes[name];
            if (!attr)
                return;
            return attr.value;
        }
    }
    removeAttr(name) {
        this.searchEl((el) => {
            el.removeAttribute(name);
        });
        return this;
    }
    css(name, value) {
        if (value) {
            this.searchEl((el) => {
                value = value.toString();
                el.style[name] = value;
            });
        }
        else {
            const css = this.elFirst.style[name];
            return css;
        }
    }
    removeCss(name) {
        this.searchEl((el) => {
            el.style[name] = null;
        });
        return this;
    }
    get class() {
        return this.elFirst.classList.toString();
    }
    hasClass(name) {
        return this.elFirst.classList.contains(name);
    }
    addClass(name) {
        if (typeof name == "string") {
            name = [name];
        }
        this.elFirst.classList.add(...name);
        return this;
    }
    removeClass(name) {
        if (typeof name == "string") {
            name = [name];
        }
        this.elFirst.classList.remove(...name);
        return this;
    }
    get value() {
        return "";
    }
    set value(value) {
    }
    resetValue() {
        return this;
    }
}
const v = (selector) => {
    return new VirtualDomControl(selector);
};
v.create = VirtualDomControl.create;
v.refresh = VirtualDomControl.refresh;

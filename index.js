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
        if (!targetEls) {
            const c = Object.keys(this.buffers);
            for (let n = 0; n < c.length; n++) {
                const id = c[n];
                const buffer = this.buffers[id];
                if (typeof selector == "string") {
                    if (selector == buffer.selector) {
                        buffer.elements.forEach((el) => {
                            els.push(el);
                        });
                    }
                }
                else {
                    selector.forEach((el0) => {
                        buffer.elements.forEach((el) => {
                            if (el0.contains(el)) {
                                els.push(el);
                            }
                        });
                    });
                }
            }
        }
        if (typeof selector == "string") {
            // selector is string...
            if (targetEls) {
                targetEls.forEach((el) => {
                    let subEls = el.querySelectorAll("[v=\"" + selector + "\"]");
                    subEls.forEach((subEl) => {
                        els.push(subEl);
                        el.removeAttribute("v");
                    });
                });
            }
            else {
                const buffs = Object.values(document.querySelectorAll("[v=\"" + selector + "\"]"));
                buffs.forEach((el) => {
                    els.push(el);
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
            let newElements = [];
            buffer.elements.forEach((el) => {
                const exists = document.body.contains(el);
                if (exists)
                    newElements.push(el);
            });
            buffer.elements = newElements;
        }
        ;
        for (let n = 0; n < c.length; n++) {
            const id = c[n];
            const buffer = this.buffers[id];
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
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                const name = VDCData.uniqId();
                this.searchEl((el) => {
                    el.setAttribute("name", name);
                });
            }
        }
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
        this.html = "";
        VirtualDomControl.refresh();
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
    setHandle(name, listener) {
        return this;
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
    css(arg1, value) {
        if (value) {
            const name = arg1.toString();
            this.searchEl((el) => {
                value = value.toString();
                el.style[name] = value;
            });
        }
        else {
            if (typeof arg1 == "string") {
                const name = arg1.toString();
                const css = this.elFirst.style[name];
                return css;
            }
            else {
                const c = Object.keys(arg1);
                for (let n = 0; n < c.length; n++) {
                    const name = c[n];
                    const value = arg1[name];
                    this.searchEl((el) => {
                        el.style[name] = value;
                    });
                }
            }
        }
        return this;
    }
    removeCss(name) {
        this.searchEl((el) => {
            el.style[name] = null;
        });
        return this;
    }
    get class() {
        const classes = this.elFirst.classList.toString();
        const classList = classes.split(" ");
        return classList;
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
    get tagName() {
        return this.elFirst.tagName;
    }
    get value() {
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                let value;
                this.searchEl((el) => {
                    if (el.checked) {
                        value = el.value;
                    }
                });
                return value;
            }
            else if (this.attr("type") == "checkbox") {
                let values = [];
                this.searchEl((el) => {
                    if (el.checked) {
                        values.push(el.value);
                    }
                });
                return values;
            }
        }
        // @ts-ignore
        const element = this.elFirst;
        return element.value;
    }
    set value(value) {
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.searchEl((el) => {
                    el.checked = false;
                    if (el.value == value) {
                        el.checked = true;
                    }
                });
                return;
            }
            else if (this.attr("type") == "checkbox") {
                let values;
                if (typeof value != "object") {
                    values = [value];
                }
                else {
                    values = value;
                }
                this.checked(false);
                this.searchEl((el) => {
                    values.forEach((v_) => {
                        if (v_ == el.value) {
                            el.checked = true;
                        }
                    });
                });
                return;
            }
        }
        this.searchEl((el) => {
            el.value = value.toString();
        });
    }
    checked(status) {
        this.searchEl((el) => {
            el.checked = status;
        });
        return this;
    }
    setPulldownEmpty(text) {
        if (this.tagName != "SELECT")
            return this;
        const optionEl = document.createElement("option");
        optionEl.setAttribute("value", "");
        optionEl.innerText = text;
        this.add(optionEl.outerHTML);
        return this;
    }
    setPulldownMenu(params) {
        this._setPulldownMenu(params);
        return this;
    }
    _setPulldownMenu(params, targetEl) {
        const c = Object.keys(params);
        for (let n = 0; n < c.length; n++) {
            const name = c[n];
            const value = params[name];
            if (typeof value == "object") {
                const optGroupEl = document.createElement("optgroup");
                optGroupEl.setAttribute("label", name.toString());
                // @ts-ignore
                this._setPulldownMenu(value, optGroupEl);
                if (targetEl) {
                    targetEl.insertAdjacentHTML("beforeend", optGroupEl.outerHTML);
                }
                else {
                    this.add(optGroupEl.outerHTML);
                }
            }
            else {
                const optionEl = document.createElement("option");
                optionEl.setAttribute("value", name.toString());
                optionEl.innerText = value.toString();
                if (targetEl) {
                    targetEl.insertAdjacentHTML("beforeend", optionEl.outerHTML);
                }
                else {
                    this.add(optionEl.outerHTML);
                }
            }
        }
    }
    resetValue() {
        this.value = "";
        return this;
    }
}
const v = (selector) => {
    return new VirtualDomControl(selector);
};
v.create = VirtualDomControl.create;
v.refresh = VirtualDomControl.refresh;

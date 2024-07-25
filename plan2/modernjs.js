class ModernJS {
    static reload() {
        const c = Object.keys(this.buffers);
        for (let n = 0; n < c.length; n++) {
            const name = c[n];
            const buffer = this.buffers[name];
            buffer.els.forEach((el, index) => {
                if (!document.body.contains(el))
                    buffer.els.splice(index);
            });
            if (!buffer.els.length)
                delete this.buffers[name];
        }
        const qss = document.querySelectorAll("[v]");
        qss.forEach((el) => {
            const vname = el.attributes["v"].value;
            el.removeAttribute("v");
            if (!this.buffers[vname])
                this.buffers[vname] = new ModernJSControl();
            this.buffers[vname].addEl(el);
        });
        return this.buffers;
    }
    static create(text) {
        const mjs = new ModernJSControl();
        const el = document.createElement("div");
        mjs.addEl(el);
        if (text)
            mjs.html = text;
        return mjs;
    }
}
ModernJS.buffers = {};
class ModernJSControl {
    constructor() {
        this.els = [];
        this.childs = {};
        this.datas = {};
    }
    addEl(el) {
        this.els.push(el);
    }
    reload() {
        this.els.forEach((el) => {
            const qss = el.querySelectorAll("[v-child]");
            qss.forEach((el2) => {
                const vname = el2.attributes["v-child"].value;
                el2.removeAttribute("v-child");
                if (!this.childs[vname])
                    this.childs[vname] = new ModernJSControl();
                this.childs[vname].addEl(el2);
            });
        });
    }
    get first() {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[0]);
        return mjs;
    }
    get last() {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[this.els.length - 1]);
        return mjs;
    }
    index(index) {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[index]);
        return mjs;
    }
    set text(value) {
        this.els.forEach((el) => {
            el.childNodes.forEach((c) => {
                el.removeChild(c);
            });
            el.innerText = value;
        });
        ModernJS.reload();
        this.reload();
    }
    get text() {
        return this.els[0].innerText;
    }
    set html(value) {
        this.els.forEach((el) => {
            el.childNodes.forEach((c) => {
                el.removeChild(c);
            });
            if (typeof value == "string") {
                el.innerHTML = value;
            }
            else if (value instanceof HTMLElement) {
                el.append(value);
            }
            else if (value instanceof ModernJSControl) {
                el.append(value.els[0]);
            }
        });
        ModernJS.reload();
        this.reload();
    }
    get html() {
        return this.els[0].innerHTML;
    }
    set outerHtml(value) {
        this.els.forEach((el) => {
            el.childNodes.forEach((c) => {
                el.removeChild(c);
            });
            el.outerHTML = value;
        });
        ModernJS.reload();
        this.reload();
    }
    append(value) {
        this.els.forEach((el) => {
            if (typeof value == "string") {
                el.insertAdjacentHTML("beforeend", value);
            }
            else if (value instanceof HTMLElement) {
                el.append(value);
            }
            else if (value instanceof ModernJSControl) {
                el.append(value.els[0]);
            }
        });
        return this;
    }
    remove() {
        this.els.forEach((el) => {
            el.remove();
        });
        return this;
    }
    style(stylesheets) {
        const c = Object.keys(stylesheets);
        for (let n = 0; n < c.length; n++) {
            const name = c[n];
            const value = stylesheets[name];
            this.els.forEach((el) => {
                el.style[name] = value;
            });
        }
        return this;
    }
    attr(name, value) {
        if (value) {
            this.els.forEach((el) => {
                el.attributes[name].value = value;
            });
            return this;
        }
        else {
            return this.els[0].attributes[name].value;
        }
    }
    removeAttr(name) {
        this.els.forEach((el) => {
            el.removeAttribute(name);
        });
        return this;
    }
    addClass(className) {
        this.els.forEach((el) => {
            el.classList.add(className);
        });
        return this;
    }
    removeClass(className) {
        this.els.forEach((el) => {
            el.classList.remove(className);
        });
        return this;
    }
    data(name, value) {
        if (value) {
            this.datas[name] = value;
            return this;
        }
        else {
            return this.datas[name];
        }
    }
    on(event, listener, options) {
        this.els.forEach((el) => {
            el.addEventListener(event, listener, options);
        });
        return this;
    }
    set onClick(listener) {
        this.on("click", listener);
    }
    set onDblClick(listener) {
        this.on("dblclick", listener);
    }
    set onFocus(listener) {
        this.on("focus", listener);
    }
    set onChange(listener) {
        this.on("change", listener);
    }
    set onMouseDown(listener) {
        this.on("mousedown", listener);
    }
    set onMouseUp(listener) {
        this.on("mouseup", listener);
    }
    set onMouseMove(listener) {
        this.on("mousemove", listener);
    }
}

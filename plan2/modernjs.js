class ModernJS {
    constructor() {
        this.els = [];
        this.childs = {};
        this.datas = {};
        this.fileBuffers = [];
    }
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
                this.buffers[vname] = new ModernJS();
            this.buffers[vname].addEl(el);
        });
        return this.buffers;
    }
    static create(text) {
        const mjs = new ModernJS();
        let tagName = "div";
        if (text.indexOf("<tr") === 0 || text.indexOf("<td") === 0)
            tagName = "table";
        const el = document.createElement(tagName);
        mjs.addEl(el);
        if (text)
            mjs.html = text;
        return mjs;
    }
    static dom(queryString) {
        const mjs = new ModernJS();
        const qss = document.querySelectorAll(queryString);
        qss.forEach((el) => {
            mjs.addEl(el);
        });
        return mjs;
    }
    addEl(el) {
        this.els.push(el);
        if (el.tagName != "INPUT")
            return;
        if (!el.attributes["type"])
            return;
        if (el.attributes["type"].value != "file")
            return;
        this.fileBuffers = [];
        el.addEventListener("change", (e) => {
            // @ts-ignore
            const el = e.target;
            for (let n = 0; n < el.files.length; n++) {
                const file = el.files[n];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const file_ = file;
                    const content = e.target.result;
                    file_.result = content;
                    this.fileBuffers.push(file_);
                };
                reader.readAsText(file);
            }
        });
    }
    reload() {
        this.els.forEach((el) => {
            const qss = el.querySelectorAll("[v-child]");
            qss.forEach((el2) => {
                const vname = el2.attributes["v-child"].value;
                el2.removeAttribute("v-child");
                if (!this.childs[vname])
                    this.childs[vname] = new ModernJS();
                this.childs[vname].parent = this;
                this.childs[vname].addEl(el2);
            });
        });
    }
    get length() {
        return this.els.length;
    }
    get first() {
        const mjs = new ModernJS();
        mjs.addEl(this.els[0]);
        return mjs;
    }
    get last() {
        const mjs = new ModernJS();
        mjs.addEl(this.els[this.els.length - 1]);
        return mjs;
    }
    index(index) {
        const mjs = new ModernJS();
        mjs.addEl(this.els[index]);
        return mjs;
    }
    get tagName() {
        return this.els[0].tagName;
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
    querySelector(queryString) {
        const mjs = new ModernJS();
        this.els.forEach((el) => {
            const qss = el.querySelectorAll(queryString);
            qss.forEach((qs) => {
                mjs.addEl(qs);
            });
        });
        return mjs;
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
            else if (value instanceof ModernJS) {
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
    get outerHtml() {
        return this.els[0].outerHTML;
    }
    append(value) {
        this.els.forEach((el) => {
            if (typeof value == "string") {
                el.insertAdjacentHTML("beforeend", value);
            }
            else if (value instanceof HTMLElement) {
                el.append(value);
            }
            else if (value instanceof ModernJS) {
                el.append(value.els[0]);
            }
        });
        ModernJS.reload();
        this.reload();
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
    isClass(className) {
        return this.els[0].classList.contains(className);
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
    removeData(name) {
        delete this.datas[name];
        return this;
    }
    on(event, listener, options) {
        const listener_ = (event) => {
            listener(event, this);
        };
        this.els.forEach((el) => {
            el.addEventListener(event, listener_, options);
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
    get value() {
        if (!(this.tagName == "INPUT" ||
            this.tagName == "SELECT" ||
            this.tagName == "TEXTAREA"))
            return;
        // @ts-ignore
        let value;
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el) => {
                    if (el.checked)
                        value = el.value;
                });
            }
            else if (this.attr("type") == "checkbox") {
                let values = [];
                this.els.forEach((el) => {
                    if (el.checked)
                        values.push(el.value);
                });
                value = values;
            }
            else if (this.attr("type") == "file") {
                value = this.fileBuffers;
            }
            else {
                if (this.length > 1) {
                    let values = [];
                    this.els.forEach((el) => {
                        values.push(el.value);
                    });
                    value = values;
                }
                else {
                    // @ts-ignore
                    const el = this.els[0];
                    value = el.value;
                }
            }
        }
        else {
            if (this.length > 1) {
                let values = [];
                this.els.forEach((el) => {
                    values.push(el.value);
                });
                value = values;
            }
            else {
                // @ts-ignore
                const el = this.els[0];
                value = el.value;
            }
        }
        return value;
    }
    set value(value) {
        if (!(this.tagName == "INPUT" ||
            this.tagName == "SELECT" ||
            this.tagName == "TEXTAREA"))
            return;
        if (typeof value == "number")
            value = value.toString();
        // @ts-ignore
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el) => {
                    if (value === el.value)
                        el.checked = true;
                });
            }
            else if (this.attr("type") == "checkbox") {
                if (typeof value == "string")
                    value = [value];
                value.forEach((v, index) => {
                    value[index] = v.toString();
                });
                this.els.forEach((el) => {
                    // @ts-ignore
                    if (value.indexOf(el.value) > -1) {
                        el.checked = true;
                    }
                    else {
                        el.checked = false;
                    }
                });
            }
            else if (this.attr("type") == "file") {
                return;
            }
            else {
                this.els.forEach((el, index) => {
                    if (typeof value == "string") {
                        el.value = value;
                    }
                    else {
                        if (value[index]) {
                            el.value = value[index].toString();
                        }
                        else {
                            el.value = "";
                        }
                    }
                });
            }
        }
        else {
            this.els.forEach((el, index) => {
                if (typeof value == "string") {
                    el.value = value;
                }
                else {
                    if (value[index]) {
                        el.value = value[index].toString();
                    }
                    else {
                        el.value = "";
                    }
                }
            });
        }
    }
    reset() {
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el) => {
                    el.checked = false;
                });
            }
            else if (this.attr("type") == "checkbox") {
                this.els.forEach((el) => {
                    el.checked = false;
                });
            }
            else {
                this.els.forEach((el, index) => {
                    el.value = "";
                });
                if (this.attr("type") == "file") {
                    this.fileBuffers = [];
                }
            }
        }
        else {
            this.els.forEach((el, index) => {
                if (this.tagName == "SELECT") {
                    // @ts-ignore
                    el.selectedIndex = 0;
                }
                else {
                    el.value = "";
                }
            });
        }
        return this;
    }
    selectAddParam(params, optgroup) {
        const c = Object.keys(params);
        for (let n = 0; n < c.length; n++) {
            const value = c[n];
            const text = params[value];
            if (typeof text == "string" || typeof text == "number") {
                const optionEL = document.createElement("option");
                optionEL.value = value;
                optionEL.innerHTML = text;
                if (optgroup) {
                    optgroup.append(optionEL);
                }
                else {
                    this.append(optionEL);
                }
            }
            else {
                const optGroupEL = document.createElement("optgroup");
                optGroupEL.label = value;
                this.selectAddParam(text, optGroupEL);
                this.append(optGroupEL);
            }
        }
        return this;
    }
    selectEmpty(text) {
        const optionEl = document.createElement("option");
        optionEl.value = "";
        optionEl.innerHTML = text;
        this.els.forEach((el) => {
            el.insertAdjacentElement("afterbegin", optionEl);
        });
        return this;
    }
    selectResetParam() {
        this.text = "";
        return this;
    }
    get childValues() {
        const c = Object.keys(this.childs);
        let values = {};
        for (let n = 0; n < c.length; n++) {
            const name = c[n];
            const child = this.childs[name];
            values[name] = child.value;
        }
        return values;
    }
}
ModernJS.buffers = {};
const dom = ModernJS.dom;

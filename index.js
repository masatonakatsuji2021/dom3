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
    /*
    public static alreadySelector(selector : string | Array<HTMLElement>) : VDCBuffer {
        const c = Object.keys(this.buffers);
        let already : VDCBuffer;
        for(let n = 0 ; n < c.length ; n++){
            const id = c[n];
            const buffer = this.buffers[id];
            if (typeof selector == "string") {
                // selector is string....
                if (buffer.selector == selector) {
                    already = buffer;
                    break;
                }
            }
            else {
                // selector is HTMLElement....

               
            }
        }

        return already;
    }
    */
    static searchSelector(selector) {
        let buffer;
        if (typeof selector == "string") {
            // selector is string...
            /*
            const already = this.alreadySelector(selector);
            if (already) buffer = already;
            */
            buffer = {
                id: this.uniqId(),
                elements: [],
                eventHandlers: {},
                selector: selector,
                data: {},
            };
            let addEls = document.querySelectorAll("[v=\"" + selector + "\"]");
            if (addEls.length) {
                addEls.forEach((el) => {
                    buffer.elements.push(el);
                    el.removeAttribute("v");
                });
            }
        }
        else {
            // selector is HTMLElements...
            let els = selector;
            buffer = {
                id: this.uniqId(),
                elements: els,
                eventHandlers: {},
                selector: null,
                data: {},
            };
        }
        this.buffers[buffer.id] = buffer;
        return buffer;
    }
    static create() {
        const element = document.createElement("div");
        let buffer = {
            id: this.uniqId(),
            elements: [element],
            eventHandlers: {},
            selector: null,
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
                    // removeEventListner....
                    /*
                    const e_ = Object.keys(buffer.eventHandlers);
                    for (let n2 = 0 ; n2 < e_.length ; n2++) {
                        const event = e_[n2];
                        const handlers = buffer.eventHandlers[event];
                        handlers.forEach((handler : EventListenerOrEventListenerObject) => {
                            buffer.elements.forEach((el : HTMLElement) => {
                                    el.removeEventListener(event, handler);
                                });
                            });
                    }*
                    */
                    buffer.elements.splice(index, 1);
                }
            });
            if (!buffer.elements.length) {
                // removeEventListner....
                /*
                const e_ = Object.keys(buffer.eventHandlers);
                for (let n2 = 0 ; n2 < e_.length ; n2++) {
                    const event = e_[n2];
                    const handlers = buffer.eventHandlers[event];
                    handlers.forEach((handler : EventListenerOrEventListenerObject) => {
                        buffer.elements.forEach((el : HTMLElement) => {
                                el.removeEventListener(event, handler);
                            });
                        });
                }
                */
                delete this.buffers[id];
            }
        }
    }
}
VDCData.buffers = {};
VDCData.bufferIndexs = {};
class VirtualDomControl {
    constructor(selector) {
        let buffer;
        if (selector) {
            buffer = VDCData.searchSelector(selector);
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
    static refresh() {
        VDCData.refresh();
    }
    /**
     * ***find*** :
     * @param selector ]
     * @returns
     */
    find(selector) {
        let els = [];
        this.searchEl((el) => {
            const subEls = el.querySelectorAll("[v=\"" + selector + "\"]");
            subEls.forEach((el) => {
                els.push(el);
                el.removeAttribute("v");
            });
        });
        return new VirtualDomControl(els);
    }
    /**
     * ***fildAll*** :
     * @returns
     */
    findAll() {
        let elementMap = {};
        let els = [];
        this.searchEl((el) => {
            const subEls = el.querySelectorAll("[v]");
            subEls.forEach((el) => {
                const selector = el.attributes["v"].value;
                if (!elementMap[selector])
                    elementMap[selector] = [];
                elementMap[selector].push(el);
                el.removeAttribute("v");
            });
        });
        let result = {};
        const c = Object.keys(elementMap);
        for (let n = 0; n < c.length; n++) {
            const selector = c[n];
            const els = elementMap[selector];
            result[selector] = new VirtualDomControl(els);
        }
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
            el.innerText = content;
        });
    }
    clear() {
        this.searchEl((el) => {
            el.innerHTML = "";
        });
        return this;
    }
    add(content, position) {
        let addContent;
        if (typeof content == "string") {
            addContent = content;
        }
        else {
            addContent = content.html;
        }
        if (!position)
            position = "beforeend";
        this.searchEl((el) => {
            el.insertAdjacentHTML(position, addContent);
        });
        return this;
    }
    remove() {
        this.searchEl((el) => {
            el.remove();
        });
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

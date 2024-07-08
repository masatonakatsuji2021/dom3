class Dom3Data {
}
Dom3Data.buffers = {};
Dom3Data.eventCallbacks = {};
class Dom3 {
    constructor(selector) {
        this.id = Dom3.makeId();
        if (typeof selector == "string") {
            const fullSelector = this.selectorConvert(selector);
            const els = document.querySelectorAll(fullSelector);
            Dom3Data.buffers[this.id] = els;
        }
        else {
            Dom3Data.buffers[this.id] = selector;
        }
        this.els((el) => {
            el.removeAttribute("v");
        });
    }
    selectorConvert(selector) {
        const selectors = selector.split(" ");
        let fullSelectors = [];
        for (let n = 0; n < selectors.length; n++) {
            fullSelectors.push("[v=\"" + selector + "\"]");
        }
        const fullSelector = fullSelectors.join(" ");
        return fullSelector;
    }
    static makeId() {
        let str = "";
        const lbn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let n = 0; n < 64; n++) {
            const word = lbn[Math.round(Math.random() * 10000) % lbn.length];
            str += word;
        }
        return str;
    }
    static get(selector) {
        return new Dom3(selector);
    }
    find(selector) {
        const fullSelector = this.selectorConvert(selector);
        let subEls = [];
        this.els((el) => {
            const buffEls = el.querySelectorAll(fullSelector);
            for (let n = 0; n < buffEls.length; n++) {
                const buffEl = buffEls[n];
                subEls.push(buffEl);
            }
        });
        return new Dom3(subEls);
    }
    els(callback) {
        const els = Dom3Data.buffers[this.id];
        for (let n = 0; n < els.length; n++) {
            const el = els[n];
            callback.bind(this)(el);
        }
    }
    get el0() {
        const els = Dom3Data.buffers[this.id];
        return els[0];
    }
    get length() {
        const els = Dom3Data.buffers[this.id];
        return els.length;
    }
    index(index) {
        const els = Dom3Data.buffers[this.id];
        const els2 = [els[index]];
        return new Dom3(els2);
    }
    get first() {
        return this.index(0);
    }
    get last() {
        return this.index(this.length - 1);
    }
    set html(htmlText) {
        this.els((el) => {
            el.innerHTML = htmlText;
        });
    }
    get html() {
        return this.el0.innerHTML;
    }
    set text(text) {
        this.els((el) => {
            // @ts-ignore
            el.innerText = text;
        });
    }
    get text() {
        // @ts-ignore
        return this.el0.innerText;
    }
    on(event, callback) {
        const fullCallback = callback.bind(this);
        this.els((el) => {
            el.addEventListener(event, fullCallback);
        });
        if (!Dom3Data.eventCallbacks[event])
            Dom3Data.eventCallbacks[event] = {};
        if (!Dom3Data.eventCallbacks[event][this.id])
            Dom3Data.eventCallbacks[event][this.id] = [];
        Dom3Data.eventCallbacks[event][this.id].push(fullCallback);
        return this;
    }
    off(event) {
        if (event) {
            if (!Dom3Data.eventCallbacks[event])
                return this;
            if (!Dom3Data.eventCallbacks[event][this.id])
                return this;
            const callbacks = Dom3Data.eventCallbacks[event][this.id];
            this.els((el) => {
                for (let n = 0; n < callbacks.length; n++) {
                    const callback = callbacks[n];
                    el.removeEventListener(event, callback);
                }
            });
            delete Dom3Data.eventCallbacks[event][this.id];
        }
        else {
            const events = Object.keys(Dom3Data.eventCallbacks);
            for (let n = 0; n < events.length; n++) {
                const event = events[n];
                // @ts-ignore
                this.off(event);
            }
        }
        console.log(Dom3Data.eventCallbacks);
        return this;
    }
}

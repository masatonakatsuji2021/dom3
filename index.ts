class Dom3Data {
    public static buffers : {[id : string] : NodeListOf<Element> | Array<Element> } = {};
    public static eventCallbacks : {[eventName : string] : Dom3EventCallbacks} = {};
}

type Dom3EventCallbacks = {
    [id : string]: Array<(this: Element, ev: Event) => any>;
};

class Dom3 {

    private id : string;

    public constructor(selector : string | Array<Element>){
        this.id = Dom3.makeId();
        if (typeof selector == "string") {
            const fullSelector = this.selectorConvert(selector);
            const els = document.querySelectorAll(fullSelector);
            Dom3Data.buffers[this.id] = els;
        }
        else {
            Dom3Data.buffers[this.id] = selector;
        }

        this.els((el : HTMLElement) => {
            el.removeAttribute("v");
        });
    }

    private selectorConvert(selector : string) : string {
        const selectors = selector.split(" ");
        let fullSelectors :Array<string> = [];
        for (let n = 0 ; n < selectors.length ; n++) {
            fullSelectors.push("[v=\"" + selector + "\"]");
        }
        const fullSelector = fullSelectors.join(" ");
        return fullSelector;
    }

    public static makeId(){
        let str : string = "";
        const lbn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let n = 0 ; n < 64 ; n++) {
            const word = lbn[Math.round(Math.random() * 10000) % lbn.length];
            str += word;
        }
        return str;
    }

    public static get(selector : string) : Dom3 {
        return new Dom3(selector);
    }

    public find(selector : string) : Dom3 {
        const fullSelector = this.selectorConvert(selector);
        let subEls : Array<Element>=  [];
        this.els((el : HTMLElement) => {
            const buffEls = el.querySelectorAll(fullSelector);
            for (let n = 0 ; n < buffEls.length ; n++) {
                const buffEl = buffEls[n];
                subEls.push(buffEl);
            }
        });

        return new Dom3(subEls);
    }

    private els(callback : Function) {
        const els = Dom3Data.buffers[this.id];
        for (let n = 0 ; n < els.length ; n++){
            const el = els[n];
            callback.bind(this)(el);
        }
    }

    private get el0() {
        const els = Dom3Data.buffers[this.id];
        return els[0];
    }

    public get length() : number {
        const els = Dom3Data.buffers[this.id];
        return els.length;
    }

    public index(index : number) : Dom3 {
        const els = Dom3Data.buffers[this.id];
        const els2 = [ els[index] ];
        return new Dom3(els2);
    }

    public get first() : Dom3 {
        return this.index(0);
    }

    public get last() : Dom3 {
        return this.index(this.length - 1);
    }

    public set html(htmlText : string) {
        this.els((el : HTMLElement) => {
            el.innerHTML = htmlText;
        });
    }

    public get html() : string {
        return this.el0.innerHTML;
    }

    public set text(text : string) {
        this.els((el : HTMLElement) => {
            el.innerText = text;
        });
    }

    public get text() : string  {
        // @ts-ignore
        return this.el0.innerText;
    }

    public styles(styles : {[name : string] : string | number | null }) : Dom3 {
        const c = Object.keys(styles);
        for (let n = 0 ; n < c.length ; n++) {
            const name = c[n];
            const value = styles[name];
            this.style(name , value);
        }
        return this;
    }
    
    public style(name: string, value: string | number | null) : Dom3 {
        this.els((el : HTMLElement) => {
            el.style[name] = value;
        });
        return this;
    }

    public attr(name : string) : any;

    public attr(name : string, value : string | number) : Dom3;

    public attr(name : string, value? : string | number) : Dom3 | any {
        if (value) {
            this.els((el : HTMLElement) => {
                el.setAttribute(name, value.toString());
            });
            return this;
        }
        else {
            return this.el0.attributes[name].value
        }
    }

    public removeAttr(name : string) : Dom3 {
        this.els((el : HTMLElement) => {
            el.removeAttribute(name);
        });
        return this;
    }

    public addClass(className : string) : Dom3 {
        this.els((el : HTMLElement) => {
            el.classList.add(className);
        });
        return this;
    }

    public removeClass(className : string) : Dom3 {
        this.els((el : HTMLElement) => {
            el.classList.remove(className);
        });
        return this;
    }

    public isClass(className : string) : boolean {
        return this.el0.classList.contains(className);
    }

    public on(event : keyof DocumentEventMap, callback : (e) => void ) : Dom3  {
        const fullCallback = callback.bind(this);
        this.els((el : HTMLElement) => {
            el.addEventListener(event, fullCallback);
        });
        if (!Dom3Data.eventCallbacks[event]) Dom3Data.eventCallbacks[event] = {}; 
        if (!Dom3Data.eventCallbacks[event][this.id]) Dom3Data.eventCallbacks[event][this.id] = [];
        Dom3Data.eventCallbacks[event][this.id].push(fullCallback);
        return this;
    }

    public off() : Dom3;

    public off(event : keyof ElementEventMap) : Dom3;

    public off(event? : keyof ElementEventMap) : Dom3 {
        if (event) {
            if (!Dom3Data.eventCallbacks[event]) return this;
            if (!Dom3Data.eventCallbacks[event][this.id]) return this;
            const callbacks = Dom3Data.eventCallbacks[event][this.id];
            this.els((el : HTMLElement) => {
                for (let n = 0 ; n < callbacks.length ; n++) {
                    const callback = callbacks[n];
                    el.removeEventListener(event, callback);
                }
            });
            delete  Dom3Data.eventCallbacks[event][this.id];
        }
        else {
            const events = Object.keys(Dom3Data.eventCallbacks);
            for (let n = 0 ; n < events.length ; n++) {
                const event  = events[n];
                // @ts-ignore
                this.off(event);
            }
        }
        return this;
    }
    

}
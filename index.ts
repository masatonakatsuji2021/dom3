interface VDCBuffer {
    id : string,
    elements: Array<HTMLElement>,
    eventHandlers : {[event: string] : Array<EventListenerOrEventListenerObject>},
    selector : string,
    data: {[name : string] : any},
}

class VDCData {
    public static buffers : {[id : string] : VDCBuffer} = {};
    public static bufferIndexs : {[selector : string] : string} = {};

    private static uniqId() {
        const lbn : string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let str : string = "";
        for (let n = 0 ; n < 32 ; n++) {
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

    public static searchSelector(selector : string | Array<HTMLElement>) : VDCBuffer {
        let buffer : VDCBuffer;
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
                selector : selector,
                data: {},
            };
 
            let addEls = document.querySelectorAll("[v=\"" + selector + "\"]");
            if (addEls.length){
                addEls.forEach((el : HTMLElement) => {
                    buffer.elements.push(el);
                    el.removeAttribute("v");
                });
            }     
        }
        else {
            // selector is HTMLElements...
            let els : Array<HTMLElement> = selector;
            buffer = {
                id: this.uniqId(),
                elements: els,
                eventHandlers: {},
                selector : null,
                data: {},
            };
        }
        this.buffers[buffer.id] = buffer;
        return buffer;
    }

    public static create() : VDCBuffer{
        const element = document.createElement("div");
        let buffer : VDCBuffer = {
            id: this.uniqId(),
            elements: [ element ],
            eventHandlers: {},
            selector : null,
            data: {},
        };
        this.buffers[buffer.id] = buffer;
        return buffer;
    }

    public static addEvent(id : string, event:  string, handler : EventListenerOrEventListenerObject) {
        if(!this.buffers[id][event]) this.buffers[id][event] = [];
        this.buffers[id][event].push(handler);
    }

    public static refresh() {
        const c = Object.keys(this.buffers);
        for(let n =0 ; n < c.length ; n++) {
            const id = c[n];
            const buffer = this.buffers[id];
            
            buffer.elements.forEach((el : HTMLElement, index: number) => {
                const exists = document.body.contains(el);
                if(!exists) {
                    
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
                    
                    buffer.elements.splice(index,1);
                }
            });

            if (!buffer.elements.length){

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

class VirtualDomControl {

    private id : string;

    public constructor(selector? : string | Array<HTMLElement>) {
        let buffer : VDCBuffer;
        if (selector) {
            buffer = VDCData.searchSelector(selector);
        }
        else {
            buffer = VDCData.create();
        }
        this.id = buffer.id;
    }

    public static create(htmlContent?: string) : VirtualDomControl {
        const res = new VirtualDomControl();
        if (htmlContent) res.html = htmlContent;
        return res;
    }

    public static refresh() {
        VDCData.refresh();
    }

    /**
     * ***find*** : 
     * @param selector ]
     * @returns 
     */
    public find(selector : string) : VirtualDomControl {
        let els : Array<HTMLElement> = [];
        this.searchEl((el : HTMLElement)=>{
            const subEls = el.querySelectorAll("[v=\"" + selector + "\"]");
            subEls.forEach((el : HTMLElement) => {
                els.push(el);
                el.removeAttribute("v");
            });
        })
        return new VirtualDomControl(els);
    }

    /**
     * ***fildAll*** : 
     * @returns 
     */
    public findAll() : {[selector : string] : VirtualDomControl} {
        let elementMap : {[selector : string] :Array<HTMLElement>} = {};
        let els : Array<HTMLElement> = [];
        this.searchEl((el : HTMLElement)=>{
            const subEls = el.querySelectorAll("[v]");
            subEls.forEach((el : HTMLElement) => {
                const selector = el.attributes["v"].value;
                if (!elementMap[selector]) elementMap[selector] = [];
                elementMap[selector].push(el);
                el.removeAttribute("v");
            });
        });

        let result = {};
        const c = Object.keys(elementMap);
        for (let n = 0 ; n < c.length ; n++) {
            const selector = c[n];
            const els = elementMap[selector];
            result[selector] = new VirtualDomControl(els);
        }
        return result;
    }

    public index(index : number) : VirtualDomControl {
        const els = [this.elements[index]];
        return new VirtualDomControl(els);
    }

    public get elements() : Array<HTMLElement> {
        if (!VDCData.buffers[this.id]) return;
        return VDCData.buffers[this.id].elements;
    }

    public get length() : number {
        return this.elements.length;
    }

    private get elFirst() : HTMLElement {
        return this.elements[0];
    }

    private get elLast() : HTMLElement {
        return this.elements[this.elements.length - 1];
    }

    private searchEl(handle : (el : HTMLElement)=>void) {
        this.elements.forEach(handle);
    }

    public get first() : VirtualDomControl {
        const els = [ this.elFirst ];
        return new VirtualDomControl(els);
    }

    public get last() : VirtualDomControl {
        const els = [ this.elLast ];
        return new VirtualDomControl(els);
    }

    public get html() : string {
        return this.elFirst.innerHTML;
    }

    public set html(content : string) {
        this.searchEl((el : HTMLElement)=>{
            el.innerHTML = content;
        });
    }

    public get outerHtml() : string {
        return this.elFirst.outerHTML;
    }

    public get text() : string {
        return this.elFirst.innerText;
    }

    public set text(content : string) {
        this.searchEl((el : HTMLElement)=>{
            el.innerText = content;
        });
    }

    public clear() : VirtualDomControl {
        this.searchEl((el : HTMLElement)=>{
            el.innerHTML = "";
        });
        return this;
    }

    public add(content : string) : VirtualDomControl;

    public add(content : VirtualDomControl) : VirtualDomControl;

    public add(content : string, position: InsertPosition) : VirtualDomControl;

    public add(content : VirtualDomControl, position: InsertPosition) : VirtualDomControl;

    public add(content : string | VirtualDomControl, position?: InsertPosition) : VirtualDomControl {
        let addContent : string;
        if (typeof content == "string") {
            addContent = content;
        } 
        else {
            addContent = content.html;
        }

        if(!position) position = "beforeend";
        this.searchEl((el : HTMLElement)=>{
            el.insertAdjacentHTML(position, addContent);
        });
        return this;
    }

    public remove() : void {
        this.searchEl((el : HTMLElement) => {
            el.remove();
        });
    }

    public on(event : keyof WindowEventMap, listener : EventListenerOrEventListenerObject) : VirtualDomControl {
        this.searchEl((el : HTMLElement) => {
            el.addEventListener(event, listener);
        });
        VDCData.addEvent(this.id, event, listener);
        return this;
    }

    public set onClick (listener : EventListenerOrEventListenerObject) {
        this.on("click", listener);        
    }

    public set onFocus (listener : EventListenerOrEventListenerObject) {
        this.on("focus", listener);       
    }

    public set onChange (listener : EventListenerOrEventListenerObject) {
        this.on("change", listener);        
    }

    public set onDblclick (listener : EventListenerOrEventListenerObject) {
        this.on("dblclick", listener);        
    }

    public data(name : string) : any;

    public data(name : string, value : any) : VirtualDomControl;

    public data(name : string, value? : any) : VirtualDomControl | any {
        if (value) {
            VDCData.buffers[this.id].data[name] = value;
            return this;
        }
        else {
            return VDCData.buffers[this.id].data[name];
        }
    }

    public removeData(name : string) : VirtualDomControl {
        delete VDCData.buffers[this.id].data[name];
        return this;
    }

    public attr(name : string) : string | number | boolean;

    public attr(name : string, value : string | number | boolean) : VirtualDomControl;

    public attr(name : string, value? : string | number | boolean) : VirtualDomControl | any {
        if (value) {
            this.searchEl((el : HTMLElement) => {
                value =value.toString();
                el.setAttribute(name, value);
            });
        }
        else {
            const attr = this.elFirst.attributes[name];
            if (!attr) return;
            return attr.value;
        }
    }

    public removeAttr(name : string) : VirtualDomControl {
        this.searchEl((el : HTMLElement) => {
            el.removeAttribute(name);
        });
        return this;
    }

    public css(name: string) : string | number;

    public css(name: string, value : string | number) : VirtualDomControl;
    
    public css(name: string, value? : string | number) : VirtualDomControl | any {
        if (value) {
            this.searchEl((el : HTMLElement) => {
                value =value.toString();
                el.style[name] = value;
            });
        }
        else {
            const css = this.elFirst.style[name];
            return css;
        }
    }

    public removeCss(name : string) : VirtualDomControl {
        this.searchEl((el : HTMLElement) => {
            el.style[name] = null;
        });
        return this;
    }

    public get class() : string {
        return this.elFirst.classList.toString();
    }

    public hasClass(name : string) : boolean {
        return this.elFirst.classList.contains(name);
    }

    public addClass(name : string | Array<string>) : VirtualDomControl {
        if (typeof name == "string") {
            name = [ name ];
        }
        this.elFirst.classList.add(...name);
        return this;
    }

    public removeClass(name : string | Array<string>) : VirtualDomControl {
        if (typeof name == "string") {
            name = [ name ];
        }
        this.elFirst.classList.remove(...name);
        return this;
    }

    public get value() : string | Array<string | number> | number {

        return "";
    }

    public set value(value : string | Array<string | number> | number) {

    }

    public resetValue() : VirtualDomControl {

        return this;
    }
}

const v = (selector : string) => {
    return new VirtualDomControl(selector);
};
v.create = VirtualDomControl.create;
v.refresh = VirtualDomControl.refresh;

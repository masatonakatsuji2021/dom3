interface VDCBuffer {
    id : string,
    elements: Array<HTMLElement>,
    data: {[name : string] : any},
    selector? : string,
}

class VDCData {
    
    public static buffers : {[id : string] : VDCBuffer} = {};

    public static uniqId() {
        const lbn : string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let str : string = "";
        for (let n = 0 ; n < 32 ; n++) {
            const word = lbn[Math.round(Math.random() * 1000) % lbn.length];
            str += word;
        }
        return str;
    }

    public static searchSelector(selector : string | Array<HTMLElement>, targetEls? : Array<HTMLElement>) : VDCBuffer {
        let buffer : VDCBuffer;
        let els : Array<HTMLElement> = [];

        if (!targetEls){

            const c = Object.keys(this.buffers);
            for (let n = 0 ; n < c.length ; n++) {
                const id = c[n];
                const buffer = this.buffers[id];
    
                if (typeof selector == "string") {
                    if (selector == buffer.selector){
                        buffer.elements.forEach((el)=>{
                            els.push(el);
                        });
                    }
                }
                else {
                    selector.forEach((el0)=>{
                        buffer.elements.forEach((el : HTMLElement) => {
                            if (el0.contains(el)){
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
                targetEls.forEach((el : HTMLElement) => {
                    let subEls = el.querySelectorAll("[v=\"" + selector + "\"]");
                    subEls.forEach((subEl : HTMLElement) => {
                        els.push(subEl);
                        el.removeAttribute("v");
                    });
                });
            }
            else{
                const buffs = Object.values(document.querySelectorAll("[v=\"" + selector + "\"]"));
                buffs.forEach((el : HTMLElement)=>{
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
        if (typeof selector == "string") buffer.selector = selector;
        this.buffers[buffer.id] = buffer;
        return buffer;
    }

    public static create() : VDCBuffer{
        const element = document.createElement("div");
        let buffer : VDCBuffer = {
            id: this.uniqId(),
            elements: [ element ],
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
            
            let newElements = [];
            buffer.elements.forEach((el : HTMLElement) => {
                const exists = document.body.contains(el);
                if(exists) newElements.push(el);
            });
            buffer.elements = newElements;
        };

        for(let n =0 ; n < c.length ; n++) {
            const id = c[n];
            const buffer = this.buffers[id];
            if (!buffer.elements.length){
                delete this.buffers[id];
            }
        }
    }
}

class VirtualDomControl {

    private id : string;

    public constructor(selector? : string | Array<HTMLElement>, targetEls? : Array<HTMLElement>) {
        let buffer : VDCBuffer;
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
                this.searchEl((el : HTMLElement) => {
                    el.setAttribute("name", name);
                });   
            }
        }
    }

    public static create(htmlContent?: string) : VirtualDomControl {
        const res = new VirtualDomControl();
        if (htmlContent) res.html = htmlContent;
        return res;
    }
    
    public create() : VirtualDomControl {
        const res = new VirtualDomControl();
        res.html = this.html;
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
        return new VirtualDomControl(selector, this.elements);
    }

    /**
     * ***fildAll*** : 
     * @returns 
     */
    public findAll(selectors? : Array<string>) : {[selector : string] : VirtualDomControl} {
        let result = {};

            this.searchEl((el : HTMLElement) => {
                const childEls = el.querySelectorAll("[v]");
                childEls.forEach((el2 : HTMLElement) => {
                    const vname = el2.attributes["v"].value;
                    const vdc = new VirtualDomControl(vname, this.elements);
                    result[vname] = vdc;
                });
            });    
        
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
            if (el.childNodes.length) {
                el.childNodes.forEach((cel : HTMLElement) => {
                    el.removeChild(cel);
                });
            }
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
            if (el.childNodes.length) {
                el.childNodes.forEach((cel : HTMLElement) => {
                    el.removeChild(cel);
                });
            }
            el.innerText = content;
        });
    }

    public clear() : VirtualDomControl {
        this.html = "";
        VirtualDomControl.refresh();
        return this;
    }

    public add(content : string) : VirtualDomControl;

    public add(content : VirtualDomControl) : VirtualDomControl;

    public add(content : string, position: InsertPosition) : VirtualDomControl;

    public add(content : VirtualDomControl, position: InsertPosition) : VirtualDomControl;

    public add(content : string | VirtualDomControl, position?: InsertPosition) : VirtualDomControl {
        if(!position) position = "beforeend";
        this.searchEl((el : HTMLElement)=>{
            if (typeof content == "string") {
                el.insertAdjacentHTML(position, content);
            } 
            else {
                content.elements.forEach((el2)=>{
                    if (position == "beforeend") {
                        el.append(el2);
                    }
                    else if (position == "beforebegin"){
                        el.before(el2);
                    }
                    else if (position == "afterend"){
                        el.after(el2);
                    }
                });
            }
        });
        return this;
    }

    public remove() : void {
        this.searchEl((el : HTMLElement) => {
            el.remove();
        });
        VDCData.refresh();

        console.log(VDCData.buffers);
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

    public setHandle(name : string, listener : EventListenerOrEventListenerObject) {
        
        return this;
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

    public css(name: {[name : string] : string}) : VirtualDomControl;

    public css(name: string, value : string | number) : VirtualDomControl;
    
    public css(arg1: string | {[name : string] : string}, value? : string | number) : VirtualDomControl | any {
        if (value) {
            const name : string = arg1.toString();
            this.searchEl((el : HTMLElement) => {
                value =value.toString();
                el.style[name] = value;
            });
        }
        else {
            if (typeof arg1 == "string") {
                const name : string = arg1.toString();
                const css = this.elFirst.style[name];
                return css;    
            }
            else {
                const c = Object.keys(arg1);
                for (let n = 0 ; n < c.length ; n++) {
                    const name = c[n];
                    const value = arg1[name];
                    this.searchEl((el : HTMLElement) => {
                        el.style[name] = value;
                    });
                }
            }
        }
        return this;
    }

    public removeCss(name : string) : VirtualDomControl {
        this.searchEl((el : HTMLElement) => {
            el.style[name] = null;
        });
        return this;
    }

    public get class() : Array<string> {
        const classes= this.elFirst.classList.toString();
        const classList = classes.split(" ");
        return classList;
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

    public get tagName() : string {
        return this.elFirst.tagName;
    }

    public get value() : string | Array<string> {
        if (this.tagName == "INPUT") {
            if(this.attr("type") == "radio") {
                let value;
                this.searchEl((el : HTMLInputElement) => {
                    if (el.checked) {
                        value = el.value;
                    }
                });
                return value;
            }
            else if (this.attr("type") == "checkbox") {
                let values = [];
                this.searchEl((el : HTMLInputElement) => {
                    if (el.checked) {
                        values.push(el.value);
                    }
                });
                return values;
            }
       }
       // @ts-ignore
       const element : HTMLInputElement = this.elFirst;
       return element.value;
    }

    public set value(value : string | number | Array<string | number>) {
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.searchEl((el : HTMLInputElement) => {
                    el.checked = false;
                    if (el.value == value) {
                        el.checked = true;
                    }
                });
                return;
            }
            else if (this.attr("type") == "checkbox") {
                let values : Array<string | number>;
                if (typeof value != "object") {
                    values = [ value ];
                }
                else {
                    values = value;
                }
                this.checked(false);
                this.searchEl((el : HTMLInputElement) => {
                    values.forEach((v_) => {
                        if (v_ == el.value) {
                            el.checked = true;
                        }
                    });
                });
                return;
            }
        }

        this.searchEl((el : HTMLInputElement) => {
            el.value = value.toString();
        });
    }

    public checked(status : boolean) : VirtualDomControl {
        this.searchEl((el : HTMLInputElement) => {
            el.checked = status;
        });
        return this;
    }

    public setPulldownEmpty(text : string) : VirtualDomControl {
        if (this.tagName != "SELECT") return this;
        const optionEl = document.createElement("option");
        optionEl.setAttribute("value", "");
        optionEl.innerText = text;
        this.add(optionEl.outerHTML);
        return this;
    }

    public setPulldownMenu(params : {[name : string | number] : string | Object}) : VirtualDomControl {
        this._setPulldownMenu(params);
        return this;
    }

    private _setPulldownMenu(params : {[name : string | number] : string | Object}, targetEl? : HTMLElement) {
        const c = Object.keys(params);
        for( let n = 0 ; n <c.length ; n++) {
            const name = c[n];
            const value = params[name];
            if (typeof value == "object") {
                const optGroupEl = document.createElement("optgroup");
                optGroupEl.setAttribute("label", name.toString());
                // @ts-ignore
                this._setPulldownMenu(value, optGroupEl);
                if (targetEl){
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
                if (targetEl){
                    targetEl.insertAdjacentHTML("beforeend", optionEl.outerHTML);
                }
                else {
                    this.add(optionEl.outerHTML);
                }
            }
        }
    }

    public resetValue() : VirtualDomControl {
        this.value = "";
        return this;
    }
}

const v = (selector : string) => {
    return new VirtualDomControl(selector);
};
v.create = VirtualDomControl.create;
v.refresh = VirtualDomControl.refresh;

interface ModernJSList {
    [name : string] : ModernJSControl,
}

class ModernJS {

    public static buffers : ModernJSList = {};

    public static reload(){

        const c = Object.keys(this.buffers);
        for(let n = 0 ; n < c.length ; n++) {
            const name = c[n];
            const buffer = this.buffers[name];

            buffer.els.forEach((el : HTMLElement, index : number) => {
                if (!document.body.contains(el)) buffer.els.splice(index);
            });
            if (!buffer.els.length) delete this.buffers[name];
        }

        const qss = document.querySelectorAll("[v]");
        qss.forEach((el : HTMLElement) => {
            const vname = el.attributes["v"].value;
            el.removeAttribute("v");
            if (!this.buffers[vname]) this.buffers[vname] = new ModernJSControl();
            this.buffers[vname].addEl(el);
        }) ;

        return this.buffers;
    }
    
    public static create(text? : string) : ModernJSControl {
        const mjs = new ModernJSControl();
        const el = document.createElement("div");
        mjs.addEl(el);
        if (text) mjs.html = text;
        return mjs;
    }

}

class ModernJSControl {

    public els : Array<HTMLElement> = [];

    public childs : ModernJSList = {};

    public datas : {[name : string] : any} = {};

    public addEl(el : HTMLElement){
        this.els.push(el);
    }

    public reload() {
        this.els.forEach((el : HTMLElement) => {
            const qss = el.querySelectorAll("[v-child]");
            qss.forEach((el2 : HTMLElement) => {
                const vname = el2.attributes["v-child"].value;
                el2.removeAttribute("v-child");
                if (!this.childs[vname]) this.childs[vname] = new ModernJSControl();
                this.childs[vname].addEl(el2);
            }) ;
        });
    }

    public get first() : ModernJSControl {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[0]);
        return mjs;
    }

    public get last() : ModernJSControl {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[this.els.length - 1]);
        return mjs;
    }

    public index(index: number) : ModernJSControl {
        const mjs = new ModernJSControl();
        mjs.addEl(this.els[index]);
        return mjs;
    }

    public get tagName() : string {
        return this.els[0].tagName;
    }

    public set text(value : string) {
        this.els.forEach((el : HTMLElement) => {
            el.childNodes.forEach((c)=>{
                el.removeChild(c);
            });
            el.innerText = value;
        });
        ModernJS.reload();
        this.reload();
    }

    public get text() : string {
        return this.els[0].innerText;
    }

    public set html(value : string | HTMLElement | ModernJSControl) {
        this.els.forEach((el : HTMLElement) => {
            el.childNodes.forEach((c)=>{
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

    public get html() : string {
        return this.els[0].innerHTML;
    }

    public set outerHtml(value : string) {
        this.els.forEach((el : HTMLElement) => {
            el.childNodes.forEach((c)=>{
                el.removeChild(c);
            });
            el.outerHTML = value;
        });
        ModernJS.reload();
        this.reload();
    }

    public get outerHtml() : string {
        return this.els[0].outerHTML;
    }

    public append(value : string | ModernJSControl) {
        this.els.forEach((el : HTMLElement) => {
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

    public remove() : ModernJSControl {
        this.els.forEach((el : HTMLElement)=>{
            el.remove();
        });
        return this;
    }

    public style(stylesheets : {[name : string] : string | number}) : ModernJSControl {
        const c = Object.keys(stylesheets);
        for (let n = 0 ; n < c.length ; n++) {
            const name = c[n];
            const value = stylesheets[name];

            this.els.forEach((el : HTMLElement) => {
                el.style[name] = value;
            });
        }
        return this;
    }

    public attr(name : string, value? : string | number) : string | ModernJSControl {
        if (value) {
            this.els.forEach((el : HTMLElement) => {
                el.attributes[name].value = value;
            });    
            return this;
        }
        else {
            return this.els[0].attributes[name].value;
        }
    }

    public removeAttr(name : string) : ModernJSControl {
        this.els.forEach((el : HTMLElement) => {
            el.removeAttribute(name);
        });    
        return this;
    }

    public addClass(className : string) : ModernJSControl {
        this.els.forEach((el : HTMLElement) => {
            el.classList.add(className);
        });
        return this;
    }

    public removeClass(className : string) : ModernJSControl {
        this.els.forEach((el : HTMLElement) => {
            el.classList.remove(className);
        });
        return this;
    }

    public data(name : string) : any;

    public data(name : string, value : any) : ModernJSControl;

    public data(name : string, value? : any) : any | ModernJSControl {
        if (value) {
            this.datas[name] = value;
            return this;
        }
        else {
            return this.datas[name];
        }
    }

    public removeData(name : string) : ModernJSControl {
        delete this.datas[name];
        return this;
    }

    public on(event : keyof HTMLElementEventMap, listener : (event : any) => void, options?: boolean | AddEventListenerOptions) : ModernJSControl {
        this.els.forEach((el : HTMLElement) => {
            el.addEventListener(event, listener,options);
        });
        return this;
    }

    public set onClick (listener : (event )=>void) {
        this.on("click", listener);
    }

    public set onDblClick (listener : (event )=>void) {
        this.on("dblclick", listener);
    }

    public set onFocus (listener : (event )=>void) {
        this.on("focus", listener);
    }

    public set onChange (listener : (event )=>void) {
        this.on("change", listener);
    }

    public set onMouseDown (listener : (event )=>void) {
        this.on("mousedown", listener);
    }

    public set onMouseUp (listener : (event )=>void) {
        this.on("mouseup", listener);
    }

    public set onMouseMove (listener : (event )=>void) {
        this.on("mousemove", listener);
    }

}
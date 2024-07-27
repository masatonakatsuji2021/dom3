interface ModernJSList {
    [name : string] : ModernJS,
}

interface ModernJSFile extends File {
    result? : string | ArrayBuffer,
}

interface ModernJSSelectOption {
    [value : string | number] : string | ModernJSSelectOption,
}

class ModernJS {

    public static buffers : ModernJSList = {};

    public els : Array<HTMLElement> = [];

    public childs : ModernJSList = {};

    public datas : {[name : string] : any} = {};

    public parent : ModernJS;

    private fileBuffers : Array<any> = [];

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
            if (!this.buffers[vname]) this.buffers[vname] = new ModernJS();
            this.buffers[vname].addEl(el);
        }) ;

        return this.buffers;
    }
    
    public static create(text? : string) : ModernJS {
        const mjs = new ModernJS();
        let tagName = "div";
        if (text.indexOf("<tr") === 0 || text.indexOf("<td") === 0) tagName = "table";
        const el = document.createElement(tagName);
        mjs.addEl(el);
        if (text) mjs.html = text;
        return mjs;
    }

    public static dom(queryString : string) : ModernJS {
        const mjs = new ModernJS();
        const qss = document.querySelectorAll(queryString);
        qss.forEach((el : HTMLElement) => {
            mjs.addEl(el);
        });
        return mjs;
    }

    public addEl(el : HTMLElement){
        this.els.push(el);

        if (el.tagName != "INPUT") return;
        if (!el.attributes["type"]) return;
        if (el.attributes["type"].value != "file") return;
        this.fileBuffers = [];
        el.addEventListener("change", (e : Event)=>{
            // @ts-ignore
            const el : HTMLInputElement = e.target;       
            for(let n = 0 ; n < el.files.length ; n++) {
                const file = el.files[n];
                const reader = new FileReader();
                reader.onload = (e) =>  {
                    const file_ : ModernJSFile = file;
                    const content = e.target.result;
                    file_.result = content;
                    this.fileBuffers.push(file_);
                };
                reader.readAsText(file);
            }
        });
    }

    public reload() {
        this.els.forEach((el : HTMLElement) => {
            const qss = el.querySelectorAll("[v-child]");
            qss.forEach((el2 : HTMLElement) => {
                const vname = el2.attributes["v-child"].value;
                el2.removeAttribute("v-child");
                if (!this.childs[vname]) this.childs[vname] = new ModernJS();
                this.childs[vname].parent = this;
                this.childs[vname].addEl(el2);
            }) ;
        });
    }

    public get length() : number {
        return this.els.length;
    }

    public get first() : ModernJS {
        const mjs = new ModernJS();
        mjs.addEl(this.els[0]);
        return mjs;
    }

    public get last() : ModernJS {
        const mjs = new ModernJS();
        mjs.addEl(this.els[this.els.length - 1]);
        return mjs;
    }

    public index(index: number) : ModernJS {
        const mjs = new ModernJS();
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

    public querySelector(queryString: string) : ModernJS {
        const mjs = new ModernJS();
        this.els.forEach((el : HTMLElement) => {
            const qss = el.querySelectorAll(queryString);
            qss.forEach((qs : HTMLElement) => {
                mjs.addEl(qs);
            });
        });
        return mjs;
    }

    public get text() : string {
        return this.els[0].innerText;
    }

    public set html(value : string | HTMLElement | ModernJS) {
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
            else if (value instanceof ModernJS) {
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

    public append(value : string | HTMLElement | ModernJS) {
        this.els.forEach((el : HTMLElement) => {
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

    public remove() : ModernJS {
        this.els.forEach((el : HTMLElement)=>{
            el.remove();
        });
        return this;
    }

    public style(stylesheets : {[name : string] : string | number}) : ModernJS {
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

    public attr(name : string, value? : string | number) : string | ModernJS {
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

    public removeAttr(name : string) : ModernJS {
        this.els.forEach((el : HTMLElement) => {
            el.removeAttribute(name);
        });    
        return this;
    }

    public isClass(className : string)  : boolean {
        return this.els[0].classList.contains(className);
    }

    public addClass(className : string) : ModernJS {
        this.els.forEach((el : HTMLElement) => {
            el.classList.add(className);
        });
        return this;
    }

    public removeClass(className : string) : ModernJS {
        this.els.forEach((el : HTMLElement) => {
            el.classList.remove(className);
        });
        return this;
    }

    public data(name : string) : any;

    public data(name : string, value : any) : ModernJS;

    public data(name : string, value? : any) : any | ModernJS {
        if (value) {
            this.datas[name] = value;
            return this;
        }
        else {
            return this.datas[name];
        }
    }

    public removeData(name : string) : ModernJS {
        delete this.datas[name];
        return this;
    }

    public on(event : keyof HTMLElementEventMap, listener : (event : Event, context: ModernJS) => void, options?: boolean | AddEventListenerOptions) : ModernJS {
        const listener_ = (event : Event) => {
            listener(event, this);
        };
        this.els.forEach((el : HTMLElement) => {
            el.addEventListener(event, listener_,options);
        });
        return this;
    }

    public set onClick (listener : (event : Event, context: ModernJS )=>void) {
        this.on("click", listener);
    }

    public set onDblClick (listener : (event : Event, context: ModernJS )=>void) {
        this.on("dblclick", listener);
    }

    public set onFocus (listener : (event : Event, context: ModernJS )=>void) {
        this.on("focus", listener);
    }

    public set onChange (listener : (event : Event, context: ModernJS )=>void) {
        this.on("change", listener);
    }

    public set onMouseDown (listener : (event : Event, context: ModernJS )=>void) {
        this.on("mousedown", listener);
    }

    public set onMouseUp (listener : (event : Event, context: ModernJS )=>void) {
        this.on("mouseup", listener);
    }

    public set onMouseMove (listener : (event : Event, context: ModernJS )=>void) {
        this.on("mousemove", listener);
    }

    public get value() : string | Array<string> {
        if (!(
            this.tagName == "INPUT" ||
            this.tagName == "SELECT" ||
            this.tagName == "TEXTAREA"
        )) return;

        // @ts-ignore
        let value : string | Array<string>;
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el : HTMLInputElement) => {
                    if (el.checked) value = el.value;
                });
            }
            else if(this.attr("type") == "checkbox") {
                let values = [];
                this.els.forEach((el : HTMLInputElement) => {
                    if (el.checked) values.push(el.value);
                });
                value = values;
            }
            else if(this.attr("type") == "file") {
                value = this.fileBuffers;
            }
            else {
                if (this.length > 1) {
                    let values = [];
                    this.els.forEach((el : HTMLInputElement) => {
                        values.push(el.value);
                    });
                    value = values;
                }
                else {
                    // @ts-ignore
                    const el : HTMLInputElement = this.els[0];
                    value = el.value;
                }
            }
        }
        else {
            if (this.length > 1) {
                let values = [];
                this.els.forEach((el : HTMLInputElement) => {
                    values.push(el.value);
                });
                value = values;
            }
            else {
                // @ts-ignore
                const el : HTMLInputElement = this.els[0];
                value = el.value;
            }
        }

        return value;
    }

    public set value(value : string | number | Array<string | number>) {
        if (!(
            this.tagName == "INPUT" ||
            this.tagName == "SELECT" ||
            this.tagName == "TEXTAREA"
        )) return;

        if (typeof value == "number") value = value.toString();

        // @ts-ignore
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el : HTMLInputElement) => {
                    if (value === el.value) el.checked = true;
                });
            }
            else if(this.attr("type") == "checkbox") {
                if (typeof value == "string") value = [ value ];
                value.forEach((v, index)=>{
                    value[index] = v.toString();
                });
                this.els.forEach((el : HTMLInputElement) => {
                    // @ts-ignore
                    if (value.indexOf(el.value) > -1) {
                        el.checked = true;
                    }
                    else{
                        el.checked = false;
                    }
                });
            }
            else if(this.attr("type") == "file") {
                return;
            }
            else {
                this.els.forEach((el : HTMLInputElement, index :  number) => {
                    if (typeof value == "string") {
                        el.value = value;
                    }
                    else {
                        if (value[index]) {
                            el.value = value[index].toString();
                        }
                        else{
                            el.value = "";
                        }
                    }    
                });
            }
        }
        else {
            this.els.forEach((el : HTMLInputElement, index :  number) => {
                if (typeof value == "string") {
                    el.value = value;
                }
                else {
                    if (value[index]) {
                        el.value = value[index].toString();
                    }
                    else{
                        el.value = "";
                    }
                }    
            });
        }
    }

    public reset() : ModernJS {
        if (this.tagName == "INPUT") {
            if (this.attr("type") == "radio") {
                this.els.forEach((el : HTMLInputElement) => {
                    el.checked = false;
                });
            }
            else if(this.attr("type") == "checkbox") {
                this.els.forEach((el : HTMLInputElement) => {
                    el.checked = false;
                });
            }
            else {
                this.els.forEach((el : HTMLInputElement, index :  number) => {
                    el.value = "";
                });
                if (this.attr("type") == "file") {
                    this.fileBuffers = [];
                }
            }
        }
        else {
            this.els.forEach((el : HTMLInputElement, index :  number) => {
                if (this.tagName == "SELECT") {
                    // @ts-ignore
                    el.selectedIndex = 0;
                }
                else{
                    el.value = "";
                }
            });
        }
        return this;
    }

    public selectAddParam(params : ModernJSSelectOption, optgroup? : HTMLOptGroupElement) : ModernJS {
        const c = Object.keys(params);
        for (let n = 0 ; n < c.length ; n++) {
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

    public selectEmpty(text : string) : ModernJS {
        const optionEl = document.createElement("option");
        optionEl.value = "";
        optionEl.innerHTML = text;
        this.els.forEach((el)=>{
            el.insertAdjacentElement("afterbegin", optionEl);
        });
        return this;
    }

    public selectResetParam() : ModernJS {
        this.text = "";
        return this;
    }

    public get childValues() : {[name : string] : string | number | Array<string | number>} {
        const c = Object.keys(this.childs);
        let values = {};
        for (let n = 0 ; n < c.length ; n++) {
            const name = c[n];
            const child = this.childs[name];
            values[name] = child.value;
        }
        return values;
    }
}
const dom = ModernJS.dom;
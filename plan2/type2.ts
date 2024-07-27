// @ts-ignore
const mjs = ModernJS.reload();

let ind : number = 0;

mjs.addBtn.onClick = () => {
    ind++;
    const newm = ModernJS.create("<div v-child=\"name\"></div><div v-child=\"code\"></div><button v-child=\"btn\">Detail</button><button v-child=\"delete\">delete</button>");

    newm.childs.name.text = "Name Text =" + ind;
    newm.childs.code.text = ("000" + ind).slice(-4);

    newm.childs.btn.data("index", ind).onClick = (e: Event, context: ModernJS) => {
        const geetId = context.data("index");
        alert("Item Button Click .... OK (" + geetId + ")");
    };

    newm.childs.delete.onClick = (e: Event, context: ModernJS) => {
        context.parent.remove();
    };

    mjs.list.append(newm);
};

mjs.reset.onClick = () => {
    mjs.list.html = "";
};
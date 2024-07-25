// @ts-ignore
const mjs = ModernJS.reload();

mjs.test1.text = "Test1 Text....";
mjs.test2.html = "<h3>Test2 Text....</h3>";
mjs.test3.text = "Test3 Text....";
mjs.test3.first.style({
    background: "green", 
    color:"white", 
    padding:"10px",
});

mjs.test3.last.style({
    background: "blue", 
    color:"white", 
    padding:"10px",
});

mjs.test3.index(4).style({
    background: "orange", 
    padding:"10px",
});

mjs.button1.onClick = ()=>{
    alert("Button1 Click .... OK");
};

mjs.reset.onClick = () => {
    mjs.area0.text = ".....OUT!";
    console.log(ModernJS.reload());
};

console.log(ModernJS.reload());

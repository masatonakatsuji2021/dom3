// @ts-ignore
const mjs = ModernJS.reload();
mjs.value2a.selectAddParam({
    a1: "Select Vaue A1",
    a2: "Select Vaue A2",
    a3: "Select Vaue A3",
    a4group: {
        111: "A4 = 111",
        222: "A4 = 222",
        333: "A4 = 333",
    }
});
mjs.value2a.selectEmpty("--- SELECT---");
mjs.submit.onClick = () => {
    console.log({
        value1: mjs.value1.value,
        value1a: mjs.value1a.value,
        value2: mjs.value2.value,
        value2a: mjs.value2a.value,
        value3: mjs.value3.value,
        value4: mjs.value4.value,
        value5: mjs.value5.value,
        value6: mjs.value6.value,
    });
};
mjs.setPattern1.onClick = () => {
    mjs.value1.value = "山口 太郎";
    mjs.value1a.value = ["山口", "太郎"];
    mjs.value2.value = "bbb";
    mjs.value2a.value = "a2",
        mjs.value3.value = "Text AAAAAA....";
    mjs.value4.value = 3;
    mjs.value5.value = [2, 4];
};
mjs.setPattern2.onClick = () => {
    mjs.value1.value = "Suzuki jirou";
    mjs.value1a.value = ["Suzuki", "jirou"];
    mjs.value2.value = "ccc";
    mjs.value2a.value = "a3",
        mjs.value3.value = "Text BBBBBBB....";
    mjs.value4.value = 5;
    mjs.value5.value = [1, 3, 5];
};
mjs.reset.onClick = () => {
    mjs.value1.reset();
    mjs.value1a.reset();
    mjs.value2.reset();
    mjs.value2a.reset(),
        mjs.value3.reset();
    mjs.value4.reset();
    mjs.value5.reset();
    mjs.value6.reset();
};

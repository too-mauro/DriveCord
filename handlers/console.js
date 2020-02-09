module.exports = (bot) => {
let prompt = process.openStdin();
prompt.addListener("data", res => {
    let x = res.toString().trim().split(/ +/g);
        bot.channels.get("632788969989603358").send(x.join(" "));
    });
}

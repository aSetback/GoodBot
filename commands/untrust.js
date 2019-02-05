const trustList = require("../trusted.json");
const trustPath = "../trusted.json";

module.exports = {
    if (!isTrusted){
      message.channel.send("I do not trust you");
      return;
    }

    let slicedID = args[0].slice(2, 20);
       if (parseTrusted().indexOf(slicedID) != -1){
         for (key in trustList.servers) {
             if (trustList.servers[key].id == message.guild.id) {
                 let indoks = trustList.servers[key].trusted.indexOf(slicedID);
                 trustList.servers[key].trusted.splice(indoks, 1);
                 fs.writeFileSync(trustPath, JSON.stringify(trustList));
                 message.channel.send("I will trust "+ args[0] +"no longer");
             }
         }
    } else {message.channel.send("I never trusted him in the first place")}
 }

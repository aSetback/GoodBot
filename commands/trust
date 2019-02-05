const trustList = require("./trusted.json");
const trustPath = "./trusted.json";
 
 module.exports = {
   if (!message.isAdmin){
      message.channel.send("I do not trust you");
      return;
    }

    let slicedID = args[0].slice(2, 20);        //  <@12345> => 12345
       if (parseTrusted().indexOf(slicedID) == -1){
         for (key in trustList.servers) {
             if (trustList.servers[key].id == message.guild.id) {
               trustList.servers[key].trusted.push(slicedID);
               message.channel.send("Now I will trust " + args[0]);
               fs.writeFileSync(trustPath, JSON.stringify(trustList));
             }
         }
       } else {message.channel.send("I already trust this person");}
  }
}

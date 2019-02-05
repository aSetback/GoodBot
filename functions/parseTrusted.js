const trustList = require("./trusted.json");
const trustPath = "./trusted.json";

module.exports = {
  let serverTrusted;
  for (key in trustList.servers) {
      if (trustList.servers[key].id == message.guild.id) {
          return trustList.servers[key].trusted;
      }
      return [];
  }
}

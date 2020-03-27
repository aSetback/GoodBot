const readline = require('readline');
const fs = require('fs');
const { once } = require('events');
const { Op } = require('sequelize');

exports.run = (client, message, args) => {
  let fileName = 'gear.txt'
  const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName),
    output: process.stdout,
  });

  const enchantable = [0, 2, 4, 6, 7, 8, 9, 14, 15, 16, 17];

  let returnInfo = '';
  readInterface.on('line', (line) => {
    let player = line.match(/(Player-)(\d{4})(-)\d\w{2,}/g)[0];
    let items = line.match(/\((\d{1,5}),(\d{1,3}),\((\d*)/g);
    let itemList = [];
    let enchantList = [];

    items.forEach((item) => {
      itemParts = item.replace(/\(/g, '').split(',');
      itemList.push(parseInt(itemParts[0]));
      enchantList.push(itemParts[2]);
    });
    client.models.item.findAll({where: {entry: {[Op.in]: itemList }}}).then((results) => {
      let sortedResults = {};
      results.forEach((result) => {
        sortedResults[result.entry] = result.item;
      });
      
      returnInfo += '```diff\n';
      returnInfo += player + '\n';
      itemList.forEach((item, key) => {
        if (enchantable.indexOf(key) != -1 && item) {
          if (!enchantList[key]) {
            returnInfo += '- ' + sortedResults[item] + ': Unenchanted\n';
          } else {
            returnInfo += '+ ' + sortedResults[item] + ': ' + enchantList[key] + '\n';
          }
          
        }
      });
      returnInfo += '```\n';
      if (returnInfo.length > 1500) {
        message.channel.send(returnInfo);
        returnInfo = '';
      }
    })
  })

  readInterface.on('close', () => {
    setTimeout(() => {
      message.channel.send(returnInfo);
    }, 1000);
  });

};
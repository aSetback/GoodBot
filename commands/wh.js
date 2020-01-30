var request = require('request');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
    let argString = args.join(' ');

    let searchUrl = 'http://classic.wowhead.com/search?q=' + argString;
    reqOpts = {
        url: searchUrl,
        headers: {
          'User-Agent': 'wowhead-client'
        }
      };

    request(reqOpts, function(err, resp, html) {
        if (err) {
          callback(err);
          return;
        }

        let embed = '';
        if (html.indexOf('search-listview') > 0) {
            embed = parseSearch(html);
        } else {
            embed = parseNormal(html);
        }
    

        message.channel.send(embed);
        return false;
    });

    function parseSearch(html) {
        return "search result";
    }

    function parseNormal(html) {
        let match = html.split('\n').filter(function(line) {
            return line.indexOf("tooltip_enus") > -1;
          })[0];
      
          if (!match) {
              return message.channel.send('Could not find item: ' + argString);
          }
          
          let iconMatch = html.split('\n').filter(function(line) {
              return line.indexOf('<link rel="image_src"') > -1;
          })[0];
          
          let icon = '';
          if (iconMatch) {
              icon = iconMatch.substr(32, iconMatch.length - 34);
          }
  
          let matchParts = match.split('<tr>');
          let itemName = '';
          let itemMessage = '';
          let matchLine = '';
          let embed = new Discord.RichEmbed()
              .setTitle(matchLine)
              .setThumbnail(icon);
          embedColor = 0x000000;
          console.log(matchParts);
          for (key in matchParts) {
  
              lineParts = matchParts[key].split('<div class=\\"whtt-sellprice\\">');
              lineParts = lineParts.join('<table>').split('<table>');
              lineParts = lineParts.join('<br \\/>').split('<br \\/>');
              lineParts = lineParts.join('<br>').split('<br>');
              lineParts = lineParts.join('\\n').split('\\n');
              lineParts = lineParts.join('<\\/div>').split('<\\/div>');
              lineParts = lineParts.join('<!--dps-->').split('<!--dps-->');
                          
              if (key == 1) {
                  if (matchParts[key].indexOf('q3') > 0) {
                      console.log('rare');
                      embedColor = 0x0070dd;
                  } else if (matchParts[key].indexOf('q4') > 0) {
                      console.log('epic');
                      embedColor = 0xa335ee;
                  } else if (matchParts[key].indexOf('q5') > 0) {
                      console.log('legendary');
                      embedColor = 0xff8000;
                  }
              }
  
              for (partKey in lineParts) {
                  let matchLine = lineParts[partKey].replace('<!--scstart2', ' <').replace(/<\/?[^>]+(>|$)/g, "").trim();
                  if (matchLine.length && matchLine != '";') {
                      if (key == 1 && partKey == 0) {
                          itemName = matchLine;
                      } else if (key != 0) {
                          if (matchLine.indexOf('Sell Price') > -1) {
                              let priceLine = matchLine.split(' ');
                              for (priceKey in priceLine) {
                                  if (priceKey == 2) {
                                      priceLine[priceKey] += 'g';
                                  }
                                  if (priceKey == 3) {
                                      priceLine[priceKey] += 's';
                                  }
                                  if (priceKey == 4) {
                                      priceLine[priceKey] += 'c';
                                  }
                              }
                              matchLine = priceLine.join(' ');
                          }
  
                          itemMessage += matchLine + '\n';
                      }
                  }
              }
          }
          embed.setColor(embedColor);
          embed.addField(itemName, itemMessage);
          return embed;
    }
};
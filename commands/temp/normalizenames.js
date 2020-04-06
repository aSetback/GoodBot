const fs = require("fs");

exports.run = async function(client, message, args) {
    client.models.character.findAll().then((characters) => {
        characters.forEach((character) => {
            let normalizedName = character.name.charAt(0).toUpperCase() + character.name.slice(1).toLowerCase();
            if (character.name != normalizedName) { 
                console.log(character.name + ' => ' + normalizedName);
                client.models.character.update({name: normalizedName}, {where: {id: character.id}});
            }
        });

    });
}

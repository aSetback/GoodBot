module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid', {
        // attributes
        // name: {
        //     type: Sequelize.STRING,
        //     allowNull: false
        // },
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        time: {
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        color: {
            type: Sequelize.STRING,
            allowNull: false
        },
        confirmation: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        softreserve: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        channelID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        memberID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}
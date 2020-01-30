module.exports = (client, Sequelize) => {
    const signup = client.sequelize.define('signup', {
        // attributes
        player: {
            type: Sequelize.STRING,
            allowNull: false
        },
        signup: {
            type: Sequelize.STRING,
            allowNull: false
        },
        raidID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
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
    signup.sync();
    return signup;
}
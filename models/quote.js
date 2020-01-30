module.exports = (client, Sequelize) => {
    const Quote = client.sequelize.define('quote', {
        // attributes
        quote: {
            type: Sequelize.TEXT,
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
    Quote.sync();
    return Quote;
}
module.exports = (client, Sequelize) => {
    const raidCategory = client.sequelize.define('raid_category', {
        // attributes
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING,
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
    raidCategory.sync();
    return raidCategory;
}
module.exports = (client, Sequelize) => {
    const Profession = client.sequelize.define('profession', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    Profession.sync();
    return Profession;
}
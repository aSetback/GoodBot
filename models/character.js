module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('character', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        class: {
            type: Sequelize.STRING,
            allowNull: true
        },
        role: {
            type: Sequelize.STRING,
            allowNull: true
        },
        mainID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        memberID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        shadowResist: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        natureResist: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        fireResist: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        frostResist: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        }        
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}
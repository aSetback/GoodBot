module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('enchant', {
        enchant: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}
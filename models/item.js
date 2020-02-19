module.exports = (client, Sequelize) => {
    const Item = client.sequelize.define('item', {
        // attributes
        entry: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        item: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
    // options
    });
    // Item.sync({force: true});
    return Item;
}
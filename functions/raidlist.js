module.exports = {
    isValidRaidID: (client, raidID) => {
        return {valid: client.config.validRaids.includes(raidID), // boolean
                raidList: client.config.validRaids};
    }
}
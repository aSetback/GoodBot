module.exports = {
    isValidRaidID: (raidID) => {
        let validRaidList = ['MC', 'BWL', 'Ony', 'ZG', 'AQ20', 'AQ40', 'Naxx', 'GL', 'Kara', 'ML', 'SSC', 'TK', 'BT', 'MH'];

        return {valid: validRaidList.includes(raidID), // boolean
                raidList: validRaidList};
    }
}
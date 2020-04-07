const fs = require("fs");

module.exports = {
    ucfirst: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
}

'use strict';

var CryptoJS = require("crypto-js");
var bodyParser = require('body-parser');

app.factory('BlockService', function () {
    var blockchain = [];

    class Block {
        constructor(index, previousHash, timestamp, data, hash) {
            this.index = index;
            this.previousHash = previousHash.toString();
            this.timestamp = timestamp;
            this.data = data;
            this.hash = hash.toString();
        }
    }
    var getGenesisBlock = () => {
        var data = [{
            sender: 'Genesis Block',
            recipient: 'Wireless Microwave',
            vote1: 0,
            vote2: 0,
            vote3: 0,
            vote4: 0
        }]
        return new Block(0, "0", 1465154705, data, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    };

    var blockchain = [getGenesisBlock()];
    
    return {
        set: function (data) {
            blockchain = data;
        },
        get: function () {
            return blockchain;
        },
        add: function (item) {
            blockchain.push(item);
        }
     }
});
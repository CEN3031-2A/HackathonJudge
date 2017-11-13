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
            category: 'Genesis Category',
            recipient: 'Wireless Microwave',
            vote1: 0,
            vote2: 0,
            vote3: 0,
            vote4: 0
        }]
        return new Block(0, "0", 1465154705, data, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    };
    var blockchain = [getGenesisBlock()];

    /* Generate the Next Block in the chain */
    var generateNextBlock = (blockData) => {
        var previousBlock = getLatestBlock();
        var nextIndex = previousBlock.index + 1;
        var nextTimestamp = new Date().getTime() / 1000;
        var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    };

    /*Get the Hash for the new Block */
    var calculateHashForBlock = (block) => {
        return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
    };

    var calculateHash = (index, previousHash, timestamp, data) => {
        return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    };

    /* Valid block check, index must be +1 and previous hash needs to match */
    var isValidNewBlock = (newBlock, previousBlock) => {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
            console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
            console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
            return false;
        }
        return true;
    };


    var getLatestBlock = () => blockchain[blockchain.length - 1];
    
    return {
        set: function (data) {
            blockchain = data;
        },
        get: function () {
            return blockchain;
        },
        add: function (newBlock) {
            if (isValidNewBlock(newBlock, getLatestBlock())) {
                blockchain.push(newBlock);
            }
        }
     }
});
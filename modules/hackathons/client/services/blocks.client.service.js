(function () {
'use strict';

  angular
    .module('hackathons')
    .factory('BlockService', BlockService);

    BlockService.$inject = ['$resource', '$http', 'Socket'];

 function BlockService($resource, $http, Socket) {

    class Block {
        constructor(index, previousHash, timestamp, data, hash) {
            this.index = index;
            this.previousHash = previousHash;
            this.timestamp = timestamp;
            this.data = data;
            this.hash = hash.toString();
        }
    };

    var getGenesisBlock = () => {
        var data = {
            sender: 'Genesis Block',
            category: 'Genesis Category',
            recipient: 'Genesis Project',
            vote: [
              {criteria: 'GenesisVotingCriteria1', value: 0},
              {criteria: 'GenesisVotingCriteria2', value: 0},
              {criteria: 'GenesisVotingCriteria3', value: 0},
              {criteria: 'GenesisVotingCriteria4', value: 0}
            ]
        }
        return new Block(0, "0", 1465154705, data, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    };

    var blockchain = [];

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

    init();

    var getLatestBlock = () => blockchain[blockchain.length - 1];

    var get = () => {
      return $http({method: 'GET', url: '/api/blocks'}).then(function(res) {
        blockchain = res.data;
      }, function(err) {
        return [];
      });
    };

    if(blockchain.length == 0)
    {
      get();
    }

    function init() {
      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }
      console.log('check 1', Socket.connected);
      Socket.on('connect', function (newBlock) {
        console.log('Connected to web socket');
      });
      // Add an event listener to the 'chatMessage' event
      Socket.on('voteMessage', function (newBlock) {
        if(newBlock.type == 'vote')
        {
          console.log('Service New Block: ' + JSON.stringify(newBlock));
          blockchain.push(newBlock);
        }
      });
    }

    return {
        set: function (data) {
            blockchain = data;
        },

        get: function () {
          return $http({url: '/api/blocks', method: 'GET'});
        },

        // Don't call this function unless blockchain in DB is empty!
        saveGenesisBlock: function () {
          var block = getGenesisBlock();
          $http({method: 'POST', url:'/api/blocks', data: block}).then(function(res) {
            console.log('Successfully saved Gen Block: ' + JSON.stringify(res.data));
          }, function(err) {
            console.log('Save Gen Block Error: ' + err);
          });
        },
        add: function (newBlockData) {
          var newBlock = generateNextBlock(newBlockData);
          if (isValidNewBlock(newBlock, getLatestBlock())) {
              $http({method: 'POST', url:'/api/blocks', data: newBlock}).then(function(res) {
                //blockchain.push(newBlock);
                Socket.emit('voteMessage', newBlock);
                Socket.on('error', function (err) {
                  console.log(err);
                });
                console.log('Saved Block to DB: ' + JSON.stringify(res.data));
              }, function(err) {
                console.log('Save Error: ' + err);
              });
          }
        }
      }
    }

}());

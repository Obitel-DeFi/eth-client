require('dotenv').config();

const Account = require('./models/account');
const Web3 = require('web3');

// Connect to Ethereum
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_HTTP_PROVIDER));

class AccountController {
  /**
   * Create new Ethereum account
   * @return {Object} Web3 keystore v3 JSON object
   */
  static create() {
    const account = web3.eth.accounts.create();
    const { privateKey } = account;
    const keystore = web3.eth.accounts.encrypt(privateKey, process.env.KEYSTORE_PW);
    return keystore;
  }

  /**
   * Setup instance with userId
   * @param {string} userId id for user in Postgres DB
   */
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Generates a keystore and saves the user in Mongo DB
   * @return {Promise} Promise for saving the user in Mongo
   */
  async perform() {
    const keystore = AccountController.create();
    await this.save(keystore);
  }

  /**
   * Save the user's private key in Mongo DB
   * @param  {Object} keystore Web3 keystore v3 JSOM object
   * @return {Promise} Promise saving the user account
   */
  async save(keystore) {
    const account = new Account({
      userId: this.userId,
      address: keystore.address,
      keystore,
    });
    await account.save();
  }

  // static find(id) {
  //   const decrypted = web3.eth.accounts.decrypt(keystore, process.env.KEYSTORE_PW);
  //   console.log(decrypted);
  // }
}

module.exports = AccountController;
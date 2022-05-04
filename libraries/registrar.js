var redis = require('redis');

class Registrar  {
    constructor() {
      // this.db = redis.createClient()
      // this.db.connect();
      this.db = new Map();
    }

    getDatabase(){
    }
    //Helpers
    makeUserKey(aor) {
        return `user:${aor}`;
      }
    makeUserPattern(realm) {
        return realm ? `user:*@${realm}` : 'user:*';
      }

    async getUser(aor){
      let key = this.makeUserKey(aor);
      let result = await this.db.get(key);
      return result;
    }
  
    //Actions
    async add(aor, obj) {
      const key = this.makeUserKey(aor);
      let result = await this.db.set(key, JSON.stringify(obj))
      return (result === 'OK');
    }

    async get(aor){
      const key = this.makeUserKey(aor);
      let result = await this.db.get(key);
      return result;
    }
  
  }

  module.exports = Registrar;
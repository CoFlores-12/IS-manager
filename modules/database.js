const mongoose  =  require('mongoose')
const db        = 'IS-Manager'
const port      = '27017'
const host      = 'localhost'
require('dotenv').config();

class Database {
    constructor(){
        this.connect();
    }

    connect(){
        mongoose.connect(`mongodb+srv://${process.env.USER_ID}:${process.env.USER_KEY}@deliverit.elvsi2t.mongodb.net/IS-Manager?retryWrites=true&w=majority`)
            .then(() => {console.log('connected to Database in mongoDB Atlas')})
            .catch(err => {console.log(err)})
    }
}

module.exports = new Database();
const mongoose  =  require('mongoose')

const schema = new mongoose.Schema({
    name: String,
    classes: [
        {
            "cod": String,
            "name": String,
            "uv": Number,
            "req": {
                "1": String,
                "2": String,
                "3": String,
            }
        }
    ]
})

module.exports = mongoose.model('careers', schema)
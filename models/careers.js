const mongoose  =  require('mongoose')

const schema = new mongoose.Schema({
    name: String,
    classes: [
        {
            "codigo": String,
            "nombre": String,
            "uv": Number,
            "requisitos": {
                "1": String,
                "2": String,
                "3": String,
            }
        }
    ]
})

module.exports = mongoose.model('careers', schema)
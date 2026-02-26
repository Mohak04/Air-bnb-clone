const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
});

// console.log(passportLocalMongoose);

userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model("User", userSchema);

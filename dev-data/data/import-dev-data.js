const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');

dotenv.config({path: './config.env'});

// Put config.env file in this data directory. Only then u can run this file. Once done delete the config file from here only!

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }).then(con => {
    console.log('DB Connection success!');
})

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));

const importData = async () => {
    try{
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);

        console.log('Data loaded successfully!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted successfully!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]=== '--import'){
    importData();
}
else if(process.argv[2]=== '--delete'){
    deleteData();
}
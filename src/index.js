const express = require('express');
const route = require('./routes/routes.js');
const { default: mongoose } = require('mongoose');
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.CLUSTER,{useNewUrlParser: true})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

 
app.use('/', route);

app.get('/',(req,res) => {
    res.send('welocome')
})


app.listen(process.env.PORT, function () {
    console.log('Express app running on port ' + (process.env.PORT))
});
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const shortid = require('shortid');
const ShortUrl = require('./models/shortUrl');

const mongo_url = process.env.MONGO_URL;

mongoose.connect(mongo_url).then( () => console.log("DB connected🗄") ).catch( (err) => {
    console.log(err + "DB not connected");
})

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));


app.get('/', async (req, res) => {
    res.render('index')
})

app.post('/', async(req, res) => {

    try {

        const fullUrl = req.body.fullUrl;
        if(!fullUrl){
            return res.render('index', {error_msg: "Please provide a URL🙂"})
        }

        const ifExists = await ShortUrl.findOne({full: fullUrl})
        if(ifExists){
            // res.render('index', {short_url: `http://localhost:3000/${ifExists.short}`})
            res.render('index', {short_url: `${req.headers.host}/${ifExists.short}`})
            return
        }

        const newShortURL = new ShortUrl({full: fullUrl, short: shortid.generate()})
        const result = await newShortURL.save();
        // res.render('index', {short_url: `http://localhost:3000/${result.short}`})
        res.render('index', {short_url: `${req.headers.host}/${result.short}`})

    } catch (error) {
        console.log(`${error} ==>> CATCH ERROR`)
    }

})

app.get('/:shortenUrl', async (req, res) => {
    try {
        const shorten = req.params.shortenUrl;
        const result = await ShortUrl.findOne({short: shorten});

        if(!result){
            return res.render('index', {error_msg: "Link doen't exists"})
        }

        res.redirect(result.full);
        
    } catch (error) {
        console.log(`${error} ==>> shortenURL catch error`)
    }
})



app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`));
// app setup
const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(cors());

// database setup
const {
    MongoClient
} = require('mongodb');
const uri = "mongodb+srv://publicAccessAccount:LsegdWIgkFPUz0dE@moviesdb.1sjrfcm.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const db = client.db("anime");
const animeList = db.collection("animeList");
const movieList = db.collection("movieList");

// constants
let responseToBeSentBack = {}

// CRUD functions

async function getData(type) {
    if (type === "ANIME") {
        return await animeList.find({}).toArray()
    } else if (type === "MOVIE") {
        return await movieList.find({}).toArray()
    }
    // if (searchStr.animeName) {
    //     return await col.find( {animeName: {$regex: searchStr.animeName,$options: "i"}} ).toArray()
    // }
}
async function writeData(dataToAdd, type) {
    let result
    let dataFormatFixed = dataToAdd

    if (!dataToAdd.movieName && !dataToAdd.movieName ) {
        responseToBeSentBack.status = 1
        responseToBeSentBack.message = `'${type.toLowerCase()}Name' is a required field`
        return
    }
    if (!dataToAdd.time) {
        responseToBeSentBack.status = 1
        responseToBeSentBack.message = `'time' is a required field`
        return
    }
    if (type === "MOVIE") {
        dataFormatFixed.movieName = toCamelCase(dataToAdd.movieName);
        result = await movieList.insertOne(dataFormatFixed)

    } else if (type === "ANIME") {
        dataFormatFixed.animeName = toCamelCase(dataToAdd.animeName);
        result = await animeList.insertOne(dataToAdd.animeName,{
            animeName: toCamelCase(dataToAdd.animeName)
        })
    }
    if (!result.insertedId) {
        responseToBeSentBack.status = 2
        responseToBeSentBack.message = `object could not be inserted`
        return
    }
    
}

function toCamelCase(str) {
    let WordsToIgnore = ["AND", "IN", "A"]
    return str.split(" ").map((v, i) => {
        if (WordsToIgnore.includes(v.toUpperCase()) && i !== 0) {
            return v.toLowerCase()
        }
        return v[0].toUpperCase() + v.slice(1).toLowerCase()
    }).join(" ")
}
async function deleteData(obj, type, isMultiple = false) {
    if (type === "MOVIE") {
        const filterCondition = {
            movieName: obj.movieName
        };
        if (!obj.movieName) {
            responseToBeSentBack.status = 1
            responseToBeSentBack.message = `only 'movieName' field can be used to delete an object`
            return
        }
        if (isMultiple) {
            var responseFromDB = await movieList.deleteMany(filterCondition)
        } else {
            var responseFromDB = await movieList.deleteOne(filterCondition)
        }

        if (responseFromDB.deletedCount === 0) {
            responseToBeSentBack.status = 2
            responseToBeSentBack.message = `No record found with movieName: '${obj.movieName}'`
            return
        }
    } else if (type === "ANIME") {

        const filterCondition = {
            animeName: obj.animeName
        };
        if (!obj.animeName) {
            responseToBeSentBack.status = 1
            responseToBeSentBack.message = `only 'animeName' field can be used to delete an object`
            return
        }
        if (isMultiple) {
            var responseFromDB = await animeList.deleteMany(filterCondition)
        } else {
            var responseFromDB = await animeList.deleteOne(filterCondition)
        }

        if (responseFromDB.deletedCount === 0) {
            responseToBeSentBack.status = 2
            responseToBeSentBack.message = `No record found with animeName: '${obj.animeName}'`
            return
        }
    }
}
// handler
const handler = async (req, res, next) => {
    responseToBeSentBack.status = 0;
    responseToBeSentBack.message = "success"
    next(); // Move to the next middleware or route handler
};

// APIs

app.get('/anime', (req, res) => {
    res.sendFile('anime/index.html');
})
app.get('/movie', (req, res) => {
    res.sendFile('movie/index.html');
})

app.post('/getAllAnime/', handler, async (req, res) => {
    responseToBeSentBack.data = await getData("ANIME")
    res.send(responseToBeSentBack);
});

app.post('/saveAnime/', handler, async (req, res) => {
    await writeData(req.body, "ANIME")
    responseToBeSentBack.data = await getData("ANIME")
    res.send(responseToBeSentBack);
});

app.post('/deleteAnime/', handler, async (req, res) => {
    await deleteData(req.body, "ANIME")
    responseToBeSentBack.data = await getData("ANIME")
    res.send(responseToBeSentBack);
});

app.post('/deleteMultipleAnime/', handler, async (req, res) => {
    await deleteData(req.body, "ANIME", true)
    responseToBeSentBack.data = await getData("ANIME")
    res.send(responseToBeSentBack);
});
app.post('/getAllMovie/', handler, async (req, res) => {
    responseToBeSentBack.data = await getData("MOVIE")
    res.send(responseToBeSentBack);
});

app.post('/saveMovie/', handler, async (req, res) => {
    await writeData(req.body, "MOVIE")
    responseToBeSentBack.data = await getData("MOVIE")
    res.send(responseToBeSentBack);
});

app.post('/deleteMovie/', handler, async (req, res) => {
    await deleteData(req.body, "MOVIE")
    responseToBeSentBack.data = await getData("MOVIE")
    res.send(responseToBeSentBack);
});

app.post('/deleteMultipleMovie/', handler, async (req, res) => {
    await deleteData(req.body, "MOVIE", true)
    responseToBeSentBack.data = await getData("MOVIE")
    res.send(responseToBeSentBack);
});

app.use((req, res) => {
    res.send(" INVALID API ")
});
app.listen(PORT, () => {
    console.log(`server started on port ${ PORT }`);
});
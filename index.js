// app setup
const express = require ( 'express' );
const app = express ( );
var cors = require( 'cors' );
const bodyParser = require ( "body-parser" );
const PORT = process.env.PORT || 3001;

app.use ( bodyParser.urlencoded ( { extended: true } ) );
app.use( express.static( `${__dirname}/public` ) );
app.use( bodyParser.json ( ) );
app.use( cors( ) );

// database setup
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://publicAccessAccount:LsegdWIgkFPUz0dE@moviesdb.1sjrfcm.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient ( uri );
const db = client.db ( "anime" );
const col = db.collection ( "animeList" );

// constants
let responseToBeSentBack = {}

// CRUD functions

async function getData ( ) {
    return await col.find( {} ).toArray()
    // if (searchStr.animeName) {
    //     return await col.find( {animeName: {$regex: searchStr.animeName,$options: "i"}} ).toArray()
    // }
}
async function writeData ( dataToAdd ) {
    if ( !dataToAdd.animeName ) {
        responseToBeSentBack.status = 1
        responseToBeSentBack.message = `'animeName' is a required field`
        return
    }
    const result = await col.insertOne ( { animeName: toCamelCase(dataToAdd.animeName) } )

    if ( !result.insertedId ) {
        responseToBeSentBack.status = 2
        responseToBeSentBack.message = `object could not be inserted`
        return
    }
    
}
function toCamelCase(str){
    let WordsToIgnore = ["AND", "IN", "A"]
    return str.split(" ").map ( (v, i) => {
        if (WordsToIgnore.includes(v.toUpperCase()) && i !== 0) {
            return v.toLowerCase()
        }
        return v[0].toUpperCase() + v.slice(1).toLowerCase()
    }).join(" ")
}
async function deleteData( obj, isMultiple = false ) {
    const filterCondition = { animeName: obj.animeName };
    if ( !obj.animeName ) {
        responseToBeSentBack.status = 1
        responseToBeSentBack.message = `only 'animeName' field can be used to delete an object`
        return
    }
    if (isMultiple) {
        var responseFromDB = await col.deleteMany ( filterCondition )
    } else {
        var responseFromDB = await col.deleteOne ( filterCondition )
    }

    if (responseFromDB.deletedCount === 0) {
        responseToBeSentBack.status = 2
        responseToBeSentBack.message = `No record found with animeName: '${obj.animeName}'`
        return
    }
    
}

// handler
const handler = async (req, res, next) => {
    responseToBeSentBack.status = 0;
    responseToBeSentBack.message = "success"
    next(); // Move to the next middleware or route handler
};

// APIs

app.get( '/', (req, res) => {
    res.sendFile('/index.html');
})

app.post('/getAllAnime/',handler , async (req, res) => {
    responseToBeSentBack.data = await getData()
    res.send (responseToBeSentBack);
});

app.post('/saveAnime/', handler, async (req, res) => {
    await writeData ( req.body )
    responseToBeSentBack.data = await getData()
    res.send ( responseToBeSentBack );
});

app.post ( '/deleteAnime/', handler, async ( req, res ) => {
    await deleteData ( req.body )
    responseToBeSentBack.data = await getData()
    res.send ( responseToBeSentBack );
});

app.post ( '/deleteMultipleAnime/', handler, async ( req, res ) => {
    await deleteData ( req.body, true )
    responseToBeSentBack.data = await getData()
    res.send ( responseToBeSentBack );
});

app.use( ( req, res ) => {
    res.send(" INVALID API ")
});
app.listen( PORT, ( ) => {
    console.log( `server started on port ${ PORT }` );
});
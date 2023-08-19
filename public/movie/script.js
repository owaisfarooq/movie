const url = "http://localhost:3001"

async function getMovies() {
    fetch(url + '/getAllMovie/', {
            method: 'POST'
        })
        .then(res => res.json())
        .then(json => {
            if (json.status !== 0) {
                alert(`ERROR: status: ${json.status} messgage: ${json.message}`)
            }
            console.table(json.data);
            const data = json.data
            const tableBody = document.getElementById("tableBody");
            tableBody.innerHTML = "";
            for (let index = 0; index < data.length; index++) {
                tableBody.innerHTML += makeRows(data[index])
            }
            return json
        })
}
async function addNewMovie () {
    const movieNameField = document.getElementById("movieNameField");
    const movieTimeField = document.getElementById("movieTimeField");
    fetch(url + '/saveMovie', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            movieName: movieNameField.value,
            time: movieTimeField.value
        })
    })
    .then(res => res.json())
    .then(json => {
        displayData ( json )
        movieNameField.value = ""
        movieTimeField.value = ""
        return json
    })
}
function displayData ( jsonData ) {
    const data = jsonData.data
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    for (let index = 0; index < data.length; index++) {
        tableBody.innerHTML += makeRows(data[index])
    }
}
async function search ( element ) {
    const searchStr = element.value.toUpperCase()
    fetch(url + '/getAllMovie', {
        method: "POST",
        body: JSON.stringify()
    })
    .then(res => res.json())
    .then(json => {
        displayData({data: json.data.filter ( v => {
            return v.movieName.toUpperCase().includes(searchStr)
        })})
    })
}
function deleteMovie(movieName) {
    fetch(url + '/deleteMovie/', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            movieName: movieName
        })
    })

    .then(res => res.json())
    .then(json => {
        displayData ( json )
        return json
    })
}

function makeRows(movieObject) {
    return `
        <tr>
            <td></td>
            <td>${movieObject.movieName}</td>
            <td>${movieObject.time ? movieObject.time : ""}</td>
            <td><button onclick="deleteMovie('${movieObject.movieName}')" class="btn btn-danger">Delete</button></td>
        </tr>
    `
}

async function initializePage() {
    getMovies()
}

initializePage()
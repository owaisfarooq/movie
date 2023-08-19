const url = "http://localhost:3001"

async function getAnimes() {
    fetch(url + '/getAllAnime/', {
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
async function addNewAnime () {
    const animeNameField = document.getElementById("animeNameField");
    const animeTimeField = document.getElementById("animeTimeField");
    fetch(url + '/saveAnime', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            animeName: animeNameField.value,
            time: animeTimeField.value
        })
    })
    .then(res => res.json())
    .then(json => {
        displayData ( json )
        animeNameField.value = ""
        animeTimeField.value = ""
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
    fetch(url + '/getAllAnime', {
        method: "POST",
        body: JSON.stringify()
    })
    .then(res => res.json())
    .then(json => {
        displayData({data: json.data.filter ( v => {
            return v.animeName.toUpperCase().includes(searchStr)
        })})
    })
}
function deleteAnime(animeName) {
    fetch(url + '/deleteAnime/', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            animeName: animeName
        })
    })

    .then(res => res.json())
    .then(json => {
        displayData ( json )
        return json
    })
}

function makeRows(animeObject) {
    return `
        <tr>
            <td></td>
            <td>${animeObject.animeName}</td>
            <td>${animeObject.time ? animeObject.time : ""}</td>
            <td><button onclick="deleteAnime('${animeObject.animeName}')" class="btn btn-danger">Delete</button></td>
        </tr>
    `
}

async function initializePage() {
    getAnimes()
}

initializePage()
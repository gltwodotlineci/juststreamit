let listResults = []
const url = "http://localhost:8000/api/v1/titles/"
const urlCat = 'http://localhost:8000/api/v1/genres/'


// Geting the best movie
function bestMovie(){
    fetch("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score")
        .then(response => response.json())
        .then(data => {
            populateTopMovie(data.results[2])
            createThreeCategories()
        })
}


function populateTopMovie(content){
    fetch(content.url)
    .then(response => response.json())
    .then(data =>{
        const topMovieContent = document.querySelector('#top-movie');
        const imageMovie = document.createElement('img')
        const title = document.createElement('h2')
        const button = document.createElement('button')
        let description = document.createElement("p")
        imageMovie.src = data.image_url
        imageMovie.className = "top-mv-img"
        title.textContent = data.title
        description.textContent = data.description
        button.textContent = "Détails"
        button.setAttribute("data-bs-target", "#topMovieModal")
        button.className = "modal-button"
        // Adding attributes to continer
        structAppearance(imageMovie, title, topMovieContent, description, button, topMovieContent)

        button.addEventListener('click', () => {
            showMovieDetails(data)
            const modal = new bootstrap.Modal(document.getElementById('modalMovie'));
            modal.show();
        });
    })
}


// creating the structure for the Top movie appereance
function structAppearance(topImg, title, mainRow, description, btn, mainRow){
    const row = document.createElement('div')
    row.className = 'row-top'
    const col1 = document.createElement('div')
    const col2 = document.createElement('div')
    col1.className = "top-img"
    col2.className = "top-content"
    col1.appendChild(topImg)
    col2.appendChild(title)
    col2.appendChild(description)
    col2.appendChild(btn)
    row.appendChild(col1)
    row.appendChild(col2)
    mainRow.appendChild(row)
}


// filling modal with movie informations
function showMovieDetails(content){
    fetch(content.url)
    .then(response => response.json())
    .then(data =>{
        let title = document.getElementById('modalTitle')
        title.textContent = data.title
        let yearAndGenres = document.getElementById('year-genres')
        let year = data.year
        let categ = data.genres
        yearAndGenres.textContent = year + ' - ' + categ
        let durationCountry = document.getElementById('duration-country')
        let duration = data.duration
        let countries = data.countries
        durationCountry.textContent = duration + 'minutes - ' + '( ' + countries +' )'
        let impbdScore = document.getElementById('imbd-score')
        let score = data.imbd_score
        impbdScore.textContent = "IMBD score: " + score + '/10'
        let longDescription = document.getElementById("long-description")
        // long description 2 for responsive case
        let longDescription2 = document.getElementById("long-description2")
        longDescription.textContent = data.long_description
        longDescription2.textContent = data.long_description

        let imgMod = document.getElementById("img-modal")
        imgMod.src = data.image_url
        let directors = document.getElementById("movie-directors")
        directors.textContent = data.directors
        let actors = document.getElementById("actors")
        actors.textContent = data.actors
    })
}


// Calling and creating objects for 3 categories
function createThreeCategories(){
    const categories = ['Drama', 'Comedy', 'Crime']
    for (let x = 0; x < categories.length; x++) {
        fetch(`http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&genre=${categories[x]}`)
            .then(response => response.json())
            .then(data =>{
                let categoriesList = []
                for (let i = 0; i < data.results.length; i++) {
                    categoriesList.push(data.results[i])                    
                }
                fetch(data.next)
                    .then(response => response.json())
                    .then(data2 => {
                    categoriesList.push(data2.results[0])
                    addMoviesToCat(categoriesList, categories[x])
                })
        })
    }
}


// adding movies to every categorie and creating grids
function addMoviesToCat(categData, key){
    let categs = document.querySelector(`#${key}`)
    let keyButtonId = 'show-' + key
    showMoreLess(keyButtonId, key)

    for (let i = 0; i < categData.length; i++) {
        let gridItem = document.createElement('div')
        let banner = document.createElement('div')
        banner.className = "cat-banner"
        gridItem.className = 'grid-item'
        gridItem.id = key + i
        let imgMov = document.createElement('img')
        let title = document.createElement('h3')
        imgMov.className = 'cat-img'
        title.className = 'top-left'
        let button = document.createElement('button')
        button.className = 'top-right'
        imgMov.src = categData[i].image_url
        imgMov.style = "width:105%"
        title.textContent = categData[i].title
        button.id = categData[i].id
        button.textContent = "Détails"
        gridItem.appendChild(banner)
        gridItem.appendChild(title)
        gridItem.appendChild(button)
        gridItem.appendChild(imgMov)        
        categs.appendChild(gridItem)
        button.addEventListener('click', () => {
            showMovieDetails(categData[i])
            const modal = new bootstrap.Modal(document.getElementById('modalMovie'));
            modal.show();
        });
    }
}

// Providing movies by category
function generalFetch(url){ // Rename general fetch.
    fetch(url)
        .then(response => response.json())
        .then(data =>{
            for (let i = 0; i < data.results.length; i++) {
                const element = data.results[i];
                listResults.push(element)
            }
            if (data.next !== null){
                generalFetch(data.next)    
            } else{
                fetchAndPopulateSelect()
            }
        }
    )
}

function fetchAndPopulateSelect() {
    const parent = document.querySelector('#parent');
    const selectList = document.createElement("select");
    selectList.id = "chooseCat"
    for (let i = 0; i < listResults.length; i++) {
        const item = listResults[i];
        let option = document.createElement('option');
        option.textContent = item.name;
        selectList.appendChild(option);
    }
    selectList.addEventListener('change', function() {
        oneCategory = []
        populateCategory(this.value)
    });
    parent.appendChild(selectList)
}


// populating data for choosed category
function populateCategory(chooseCat){
    fetch(`http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&genre=${chooseCat}`)
    .then(response => response.json())
    .then(data => {
        let ctegoryListData = []
        for (let i = 0; i < data.results.length; i++) {
            ctegoryListData.push(data.results[i])
        }
        fetch(data.next)
        .then(response => response.json())
        .then(data2 =>{
            ctegoryListData.push(data2.results[0])
        
        itemsChoosedCategory(ctegoryListData)
        })
    })

}

function itemsChoosedCategory(data){
    let categoryDiv = document.querySelector("#choosenCategory")
    let showButton = document.querySelector('#show-choosed');
    categoryDiv.innerHTML = ""

    if (data.length > 0) {
        showButton.classList.remove('no-data');
    } else{
        showButton.classList.add('no-data')
    }

    // creating and populating 6 films grid
    for (let i = 0; i < data.length; i++) {
        let gridItem = document.createElement('div')
        let banner = document.createElement('div')
        banner.className = "cat-banner"
        gridItem.id = `choosenGrid${data[i].id}`
        gridItem.className = 'grid-item'
        let imgMov = document.createElement('img')
        imgMov.className = 'cat-img'
        let title = document.createElement('h3')
        title.className = 'top-left'
        let button = document.createElement('button')
        button.className = 'top-right'
        button.id = `choosed${data[i].id}`
        button.textContent = "Détails"
        imgMov.src = data[i].image_url
        imgMov.style = "width:105%"
        title.textContent = data[i].title
        gridItem.appendChild(banner)
        gridItem.appendChild(title)
        gridItem.appendChild(button)
        gridItem.appendChild(imgMov)
        categoryDiv.append(gridItem)
        button.addEventListener('click', () => {
            showMovieDetails(data[i])
            const modal = new bootstrap.Modal(document.getElementById('modalMovie'));
            modal.show();
        });
    }
}

// showing more or less button in responsive case
function showMoreLess(givenId, key){
    console.log(document.getElementById(givenId))
    function callShowButton(){
        console.log("query selector - key: ", document.querySelector(`#${key}`), key)
        document.querySelector(`#${key}`).classList.toggle('show-more');
        console.log("query selector - key: ", document.querySelector(`#${key}`), key)
        this.textContent = this.textContent === "Voir plus" ? "Voir moins" : "Voir plus";
    }

    document.getElementById(givenId).addEventListener('click', callShowButton);
}


// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', bestMovie)
document.addEventListener('DOMContentLoaded', () => generalFetch(urlCat))
document.addEventListener('DOMContentLoaded', () => showMoreLess('show-choosed','choosenCategory'));

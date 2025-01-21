let listResults = []
let listAllMovies = []
const url = "http://localhost:8000/api/v1/titles/"
const urlCat = 'http://localhost:8000/api/v1/genres/'
const urlPivot = 'http://localhost:8000/api/v1/titles/?imdb_score_min='
let imbd_max = 11
const threeCategories = {'Drama': [], 'Comedy': [], 'Crime': []}
let oneCategory = {}


// Geting the best movie
function bestMovie(){
    fetch(`${url}?imdb_score_min=${encodeURIComponent(imbd_max)}`)
        .then(response => response.json())
        .then(data => {
            if (data.count < 1){
                imbd_max--;
                bestMovie()
            } else {
                console.log("Etape A1")
                createUrlsCategory(threeCategories, data)
                populateTopMovie(data.results[1])
            }
        })
}


function populateTopMovie(content){
    fetch(content.url)
    .then(response => response.json())
    .then(data =>{
        const topMovieContent = document.querySelector('#top-movie');
        const imageMovie = document.createElement('img')
        const title = document.createElement('h4')
        const button = document.createElement('button')
        let description = document.createElement("p")
        imageMovie.src = data.image_url
        title.textContent = data.title
        description.textContent = data.description
        button.textContent = "Détails"
        button.id = "movie-modal"
        // Adding attributes to continer
        topMovieContent.appendChild(imageMovie)
        topMovieContent.appendChild(title)
        topMovieContent.append(button)
        topMovieContent.appendChild(description)
        button.addEventListener('click', () => showMovieDetails(content));

    })

}


function showMovieDetails(content) {
    // Assuming you have a modal element with id 'movie-modal'
    const modal = document.getElementById('movie-modal');
    
    // Populate modal content
    modal.outerHTML = `
        <h3>${content.title}</h3>
        <img src="${content.image_url}" alt="${content.title}">
        <p>Réalisé par ${content.directors}</p>

        <p>${content.long_description}</p>
        <p>Avec ${content.actors}</p>
    `;
    
    // Open the modal (you might need to adjust this based on your modal library or framework)
    modal.style.display = 'block';
}

// populating the categorie movies with their url
function createUrlsCategory(categories_obj, movies){
    console.log("Etape B1")
    for (let [key, value] of Object.entries(categories_obj)) {
        for (let i = 0; i < movies.results.length; i++) {
            if (value.length < 6){
                if (movies.results[i].genres.includes(key)){
                    value.push(movies.results[i].url);
                }
            }
        }
    }
    if (categories_obj.Drama.length < 6 || categories_obj.Comedy.length < 6 || categories_obj.Crime.length < 6){
        fetch(movies.next)
        .then(response => response.json())
        .then(data => {
           createUrlsCategory(categories_obj, data)
        })
    } else{
        console.log("Etap C1")
        addMoviesToCat()
    }
}


// adding movies to every categorie
function addMoviesToCat(){
    for (let [key, value] of Object.entries(threeCategories)) {
        const categs = document.querySelector(`#${key}`)
        for (let i = 0; i < value.length; i++) {            
            let gridItem = document.createElement('div');
            gridItem.className = 'grid-item'
            gridItem.id = key + i
            fetch(value[i])
                .then(response => response.json())
                .then(data => {
                let imgMov = document.createElement('img')
                let title = document.createElement('h5')
                imgMov.src = data.image_url
                title.textContent = data.title
                gridItem.appendChild(title)
                gridItem.appendChild(imgMov)
                categs.appendChild(gridItem)
                })
        }      
    }       
}


// Providing movies by category
function generalFetch(url){
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
    // selectList.id = "SelectCategory"
    for (let i = 0; i < listResults.length; i++) {
        const item = listResults[i];
        const option = document.createElement('option');
        option.value = item.name
        option.textContent = item.name;
        selectList.appendChild(option);        

    }
    selectList.addEventListener('change', function() {
        afterSelectCat(this.value);
        populateCategory(url, this.value)
    });
    parent.appendChild(selectList)
}


// populating data for choosed category
function populateCategory(url, chooseCat){
    fetch(`${url}?imdb_score_min=${encodeURIComponent(imbd_max)}`)
    .then(response => response.json())
    .then(data => {
        if (data.count < 1){
            imbd_max--;
            populateCategory()
        } else {
            creatingChoosedCat(data, chooseCat)
            afterSelectCat(chooseCat)
            console.log("Category hList", oneCategory)           
        }
    })
}


function creatingChoosedCat(data, choosed){
    oneCategory = {}
    oneCategory[choosed] = [] 
    for (let i = 0; i < data.results.length; i++){
        if (data.results[i].genres.includes(choosed)){
            oneCategory[choosed].push(data.results[i])
        }
    }
}

function afterSelectCat(choosed){
    let categoryDiv = document.querySelector("#choosedCategory")
    let nameCategory = document.createElement('h5')
    nameCategory.id = choosed
    nameCategory.innerHTML = choosed
    categoryDiv.appendChild(nameCategory)
}


function itemsChoosedCategory(){
    const categoryDiv = document.querySelector("#choosedCategory")
    let gridItem = document.createElement('div');
    gridItem.className = 'grid-item'
    console.log("Data at grid: ", oneCategory?.choosed)

    categoryDiv.append(gridItem)

}


// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', bestMovie(), generalFetch(urlCat));

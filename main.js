let listResults = []
const url = "http://localhost:8000/api/v1/titles/"
const urlCat = 'http://localhost:8000/api/v1/genres/'
let imbd_max = 11
const threeCategories = {'Drama': [], 'Comedy': [], 'Crime': []}
let oneCategory = []


// Geting the best movie
function bestMovie(){
    fetch("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score")
        .then(response => response.json())
        .then(data => {
            createUrlsCategory(threeCategories, data)
            populateTopMovie(data.results[0])
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
        button.id = "topMovieModal"
        button.className = "modal-button"
        // Adding attributes to continer
        topMovieContent.appendChild(imageMovie)
        topMovieContent.appendChild(title)
        topMovieContent.append(button)
        topMovieContent.appendChild(description)
        button.addEventListener('click', () => showMovieDetails(content));
    })
}


function showMovieDetails(content) {
    // Creating modal with Top rated movie'
    const modal = document.getElementById('topMovieModal');
    let modalTopMovie = document.createElement('div');
    modalTopMovie.id = "modalTopMovie"

    // Populate modal content
    modal.innerHTML = `
    <div id="mainMovieMod" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>${content.title}</h3>
            <img src="${content.image_url}" alt="${content.title}">
            <p>Réalisé par ${content.directors}</p>

            <p>${content.long_description}</p>
            <p>Avec ${content.actors}</p>
        
            <button class="modal-button" id="close_modal_button">
                Fermer
            </button>
        
        </div>
    </div>
    `;
    
    // Open the modal
    modal.style.display = 'block';
}

// Populating the categorie movies with their url
function createUrlsCategory(categories_obj, movies){
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
                const button = document.createElement('button')
                imgMov.src = data.image_url
                title.textContent = data.title
                button.id = data.id
                button.textContent = "Détails"
                gridItem.appendChild(title)
                gridItem.appendChild(imgMov)
                gridItem.appendChild(button)
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
        oneCategory = []
        afterSelectCat(this.value);
        populateCategory(this.value)
    });
    parent.appendChild(selectList)
}


// populating data for choosed category
function populateCategory(chooseCat){
    fetch("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score")//{encodeURIComponent(imbd_max)}`)
    .then(response => response.json())
    .then(data => {
        creatingChoosedCat(data, chooseCat)
    })
}


function creatingChoosedCat(data, choosed){
    for (let i = 0; i < data.results.length; i++){
        if (data.results[i].genres.includes(choosed)){
            if (oneCategory.length < 6 || oneCategory == []){
                oneCategory.push(data.results[i].url)
            }
        }
    }
    if (oneCategory.length < 6){
        fetch(data.next)
            .then(response => response.json())
            .then(item => {
                creatingChoosedCat(item, choosed)
            })
    } else{
        itemsChoosedCategory(choosed)
    }
}


function afterSelectCat(choosed){
    const title = document.querySelector("#choosedTitle")
    title.textContent = choosed
}


function itemsChoosedCategory(){
    const categoryDiv = document.querySelector("#choosenCategory")    
    // creating and populating 6 films grid
    for (let i = 0; i < oneCategory.length; i++) {
        fetch(oneCategory[i])
            .then(results => results.json())
            .then(data => {
                let gridItem = document.createElement('div');
                gridItem.className = 'grid-item'
                let imgMov = document.createElement('img')
                let title = document.createElement('h5')
                const button = document.createElement('button')
                button.id = `choosed${data.id}`
                button.textContent = "Détils"
                imgMov.src = data.image_url
                title.textContent = data.title
                gridItem.appendChild(title)
                gridItem.appendChild(imgMov)
                gridItem.appendChild(button)
                categoryDiv.append(gridItem)
            })
    }
}


// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', bestMovie(), generalFetch(urlCat));

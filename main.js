let listResults = []
let listAllMovies = []
const url = "http://localhost:8000/api/v1/titles/"
const urlCat = 'http://localhost:8000/api/v1/genres/'
let imbd_max = 9
const threeCategories = {'Drama': [], 'Comedy': [], 'Crime': []}
const oneCategory = []


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
                populateTopMovie(data.results[0])
            }
        })
}


function populateTopMovie(content){
    const topMovieContent = document.querySelector('#top-movie');
    const imageMovie = document.createElement('img')
    const title = document.createElement('h4')
    let description = document.createElement("p")
    imageMovie.src = content.image_url
    title.textContent = content.title 
    description.textContent = content.description
    // Adding attributes to continer
    topMovieContent.appendChild(imageMovie)
    topMovieContent.appendChild(title)
    topMovieContent.appendChild(description)
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
    console.log("Three categories after... ", threeCategories)
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
    });
    parent.appendChild(selectList)
}


function afterSelectCat(choosed){
    const categoryDiv = document.querySelector("#choosedCategory")
    let nameCategory = document.createElement('h5')
    nameCategory.id = 'choosedCat'
    nameCategory.innerHTML = choosed
    categoryDiv.appendChild(nameCategory)

    // adding movies grids
    for (let i = 0; i < value.length; i++) {            
        let gridItem = document.createElement('div');
        gridItem.className = 'grid-item'
        gridItem.id = key + i
        fetch(value[i])
            .then(response => response.json())
            .then(data => {
            moviesCat = data
            let imgMov = document.createElement('img')
            let title = document.createElement('h4')
            imgMov.src = data.image_url
            title.textContent = data.title
            gridItem.appendChild(title)
            gridItem.appendChild(imgMov)
            categs.appendChild(gridItem)
            })
    } 
    console.log("Choosed option: ", choosed)

}


// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', bestMovie(), generalFetch(urlCat));

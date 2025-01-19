let listResults = []
let listAllMovies = []
const url = "http://localhost:8000/api/v1/titles/"
const urlCat = 'http://localhost:8000/api/v1/genres/'
let imbd_max = 9
const threeCategories = {'Drama': [], 'Comedy': [], 'Crime': []}


// Geting the best movies
function bestMovie(){
    fetch(`${url}?imdb_score_min=${encodeURIComponent(imbd_max)}`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length < 1) {
                imbd_max--;
                bestMovie()
            }
            else{
                const topMovies = data
                const topMovie = topMovies.results[0]
                movie_url = topMovie.url
                fetch(movie_url)
                    .then(response => response.json())
                    .then(item => {
                        populateTopMovie(item)
                    })
                    // calling the fonction to populate categories url
                    createUrlsCategory(threeCategories, topMovies)
                    console.log("All movies Top: ", threeCategories.Comedy)
            }
        })
}

// populating the categorie movies with their url
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


function fetchAndPopulateSelect() {
    const parent = document.querySelector('#parent');
    const selectList = document.createElement("select");
    // selectList.id = "SelectCategory"
    for (let i = 0; i < listResults.length; i++) {
        const item = listResults[i];
        const option = document.createElement('option');
        option.value = item.name
        option.textContent = item.name;
        selectList.appendChild(option);        
    }
    selectList.addEventListener('change', getCategorySelected)
    parent.appendChild(selectList)
}

// Geting the selected category:
function getCategorySelected(event){
    const containerCat = document.createElement('div')
    console.log(event.target.value)
}

  
// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', generalFetch(urlCat));
bestMovie()

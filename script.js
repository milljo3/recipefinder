const searchButton = document.querySelector('#recipe-button');
const searchInput = document.querySelector('#recipe-input');
const recipeList = document.querySelector('#recipe-list');
const invalidInput = document.querySelector('#invalid');
const modalOverlay = document.querySelector('#modal-overlay');
const modalImage = document.querySelector('#modal-header img');
const modalTitle = document.querySelector('#modal-header-content h1');
const modalAnchor = document.querySelector('#modal-header-content a');
const closeButton = document.querySelector('#close-modal');
const modalInstructions = document.querySelector('#modal-body p');
const modalIngredientList = document.querySelector('#ingredients-list');

const favoritesList = document.querySelector('#recipe-list-favorites');
const noFavorites = document.querySelector('#no-favorites');

const forums = {
    search: document.querySelector('#search-forum'),
    favorites: document.querySelector('#favorites-forum')
};

const buttons = {
    search: document.querySelector('#forum-search-selection'),
    favorites: document.querySelector('#forum-favorites-selection')
};

let currentForum = 'search';

function searchRecipe() {
    const recipeName = searchInput.value;
    if (recipeName) {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeName}`;

        fetch(url)
            .then(response => response.json())
            .then(data => loadRecipeCards(data))
            .catch(error => {
                console.log(error)
                invalidInput.style.display = 'block';
            });
    }
    else {
        invalidInput.style.display = 'block';
    }
}

function loadRecipeCards(data) {
    recipeList.innerHTML = '';

    if (data.meals.length > 1) {
        const recipeGrid = document.createElement('div');
        recipeGrid.className = 'recipe-grid';
        recipeList.appendChild(recipeGrid);

        for (const recipe of data.meals) {
            recipeGrid.appendChild(generateRecipeCard(recipe));
        }
        invalidInput.style.display = 'none';
    }
    else if (data.meals.length > 0) {
        const recipeGridOne = document.createElement('div');
        recipeGridOne.className = 'recipe-one';
        recipeList.appendChild(recipeGridOne);

        for (const recipe of data.meals) {
            recipeGridOne.appendChild(generateRecipeCard(recipe));
        }
        invalidInput.style.display = 'none';
    }
    else {
        invalidInput.style.display = 'block';
    }
}

function generateRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-grid-item'

    const recipeImage = document.createElement('img');
    recipeImage.src = recipe.strMealThumb;
    recipeImage.alt = 'Recipe Image';

    const recipeCardContent = document.createElement('div');
    recipeCardContent.className = 'recipe-grid-item-content';

    const cardTitle = document.createElement('h2');
    cardTitle.innerText = recipe.strMeal;

    const viewMoreButton = document.createElement('button');
    viewMoreButton.innerText = 'View More';
    viewMoreButton.className = 'view-more';
    viewMoreButton.addEventListener('click', function () {
        showModal(recipe);
    })

    const starButton = document.createElement('button');
    starButton.innerHTML = '&#9733';
    starButton.className = checkFavorite(recipe) ? 'favorited' : 'unfavorited';
    starButton.classList.add('star');
    starButton.addEventListener('click', function() {
        toggleFavorite(recipe, starButton);
    })

    recipeCardContent.appendChild(cardTitle);
    recipeCardContent.appendChild(viewMoreButton);
    recipeCard.appendChild(recipeImage);
    recipeCard.appendChild(recipeCardContent);
    recipeCard.appendChild(starButton);
    return recipeCard;
}

function showModal(recipe) {
    modalIngredientList.innerHTML = '';
    modalOverlay.style.display = 'flex';
    document.body.classList.add('modal-open');

    modalImage.src = recipe.strMealThumb;
    modalTitle.innerHTML = recipe.strMeal;
    modalAnchor.href = recipe.strYoutube;

    modalInstructions.innerHTML = recipe.strInstructions;

    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        if (ingredient) {
            const quantity = recipe[`strMeasure${i}`];
            if (quantity) {
                generateIngredient(ingredient, quantity);
            }
            else {
                generateIngredient(ingredient);
            }
        }
    }

    styleIngredientRows();
}

function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function generateIngredient(ingredient, quantity = '') {
    const ingredientRow = document.createElement('div');
    ingredientRow.className = 'ingredient-row';

    const ingredientName = document.createElement('div');
    ingredientName.className = 'ingredient-name';
    ingredientName.innerText = ingredient;

    const ingredientQuantity = document.createElement('div');
    ingredientQuantity.className = 'ingredient-quantity';
    ingredientQuantity.innerText = quantity;

    ingredientRow.appendChild(ingredientName);
    ingredientRow.appendChild(ingredientQuantity);
    modalIngredientList.appendChild(ingredientRow);
}

function styleIngredientRows() {
    const ingredientRows = modalIngredientList.querySelectorAll('.ingredient-row');
    const numberOfIngredientRows = ingredientRows.length;

    for (let i = 0; i < numberOfIngredientRows; i++) {
        const opacity = 1 - (i / (numberOfIngredientRows - 1));
        ingredientRows[i].style.borderBottom = `1px solid rgba(204, 204, 204, ${opacity})`;
    }

}

function switchForum(forumKey) {
    if (forumKey !== currentForum) {
        buttons[currentForum].className = 'forum-selection-unselected';
        buttons[forumKey].className = 'forum-selection-selected';

        forums[currentForum].style.display = 'none';
        forums[forumKey].style.display = 'flex';

        currentForum = forumKey;
    }
}

function checkFavorite(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const index = favorites.findIndex(fav => fav.idMeal === recipe.idMeal);

    return index !== -1;
}

function toggleFavorite(recipe, button) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.idMeal === recipe.idMeal);

    if (index !== -1) {
        favorites.splice(index, 1);
        button.className = 'star unfavorited';
    }
    else {
        favorites.push(recipe);
        button.className = 'star favorited';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    updateRecipeCardStates(recipe);
}

function updateRecipeCardStates(recipe) {
    const searchCards = recipeList.querySelectorAll('.recipe-grid-item');
    updateCards(searchCards, recipe);

    const favoriteCards = favoritesList.querySelectorAll('.recipe-grid-item');
    updateCards(favoriteCards, recipe);

    if (currentForum === 'favorites') {
        displayFavorites();
    }
}

function updateCards(cards, recipe) {
    cards.forEach(card => {
        const starButton = card.querySelector('.star');
        if (starButton && card.querySelector('h2').innerText === recipe.strMeal) {
            starButton.className = checkFavorite({ idMeal: recipe.idMeal }) ? 'star favorited' : 'star unfavorited';
        }
    });
}


function displayFavorites() {
    favoritesList.innerHTML = '';
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

    noFavorites.style.display = savedFavorites.length === 0 ? 'block' : 'none';

    if (savedFavorites.length > 0) {
        const recipeGrid = document.createElement('div');
        recipeGrid.className = savedFavorites.length > 1 ? 'recipe-grid' : 'recipe-one';
        favoritesList.appendChild(recipeGrid);

        savedFavorites.forEach(recipe => {
            recipeGrid.appendChild(generateRecipeCard(recipe));
        })
    }
}

searchButton.addEventListener('click', searchRecipe);
closeButton.addEventListener('click', closeModal);
buttons.search.addEventListener('click', function() {
    switchForum('search')
});
buttons.favorites.addEventListener('click', function() {
    displayFavorites();
    switchForum('favorites')
});
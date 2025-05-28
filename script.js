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
        recipeGrid.id = 'recipe-grid';
        recipeList.appendChild(recipeGrid);

        for (const recipe of data.meals) {
            generateRecipeCard(recipe, recipeGrid);
        }
        invalidInput.style.display = 'none';
    }
    else if (data.meals.length > 0) {
        const recipeGridOne = document.createElement('div');
        recipeGridOne.id = 'recipe-one';
        recipeList.appendChild(recipeGridOne);

        for (const recipe of data.meals) {
            generateRecipeCard(recipe, recipeGridOne);
        }
        invalidInput.style.display = 'none';
    }
    else {
        invalidInput.style.display = 'block';
    }
}

function generateRecipeCard(recipe, parent) {
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
    viewMoreButton.addEventListener('click', function () {
        showModal(recipe);
    })

    recipeCardContent.appendChild(cardTitle);
    recipeCardContent.appendChild(viewMoreButton);
    recipeCard.appendChild(recipeImage);
    recipeCard.appendChild(recipeCardContent);
    parent.appendChild(recipeCard);
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

searchButton.addEventListener('click', searchRecipe)
closeButton.addEventListener('click', closeModal);
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search');
    const recipesContainer = document.getElementById('recipes-container');
    const savedRecipesContainer = document.getElementById('saved-recipes-container');
    const addRecipeButton = document.getElementById('add-recipe-button');
    const recipeModal = document.getElementById('recipe-modal');
    const addRecipeModal = document.getElementById('add-recipe-modal');
    const closeModalButtons = document.querySelectorAll('.close');

    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

    searchButton.addEventListener('click', handleSearch);
    addRecipeButton.addEventListener('click', openAddRecipeModal);
    closeModalButtons.forEach(button => button.addEventListener('click', closeModal));

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            fetchRecipes(query);
        }
    }

    function fetchRecipes(query) {
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=a5a7213043c54665ab5cfc62abb2c78c`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayRecipes(data.results);
            })
            .catch(error => console.error('Error fetching recipes:', error));
    }

    function displayRecipes(recipes) {
        recipesContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe, true);
            recipesContainer.appendChild(recipeCard);
        });
    }

    function createRecipeCard(recipe, isSearchResult = false) {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button onclick="fetchRecipeDetails(${recipe.id})">View Recipe</button>
        `;
        if (!isSearchResult) {
            recipeCard.innerHTML += `
                <button onclick="deleteRecipe(${recipe.id})">Delete Recipe</button>
            `;
        }
        return recipeCard;
    }

    window.fetchRecipeDetails = function(recipeId) {
        fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=a5a7213043c54665ab5cfc62abb2c78c`)
            .then(response => response.json())
            .then(recipe => {
                displayRecipeDetails(recipe);
            })
            .catch(error => console.error('Error fetching recipe details:', error));
    };

    function displayRecipeDetails(recipe) {
        const recipeDetails = `
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>Ingredients</h3>
            <ul>
                ${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
            </ul>
            <h3>Instructions</h3>
            <p>${recipe.instructions}</p>
        `;
        document.getElementById('recipe-details').innerHTML = recipeDetails;
        recipeModal.style.display = 'block';
        document.getElementById('save-recipe').onclick = function() {
            saveRecipe(recipe);
        };
    }

    function saveRecipe(recipe) {
        if (!savedRecipes.some(r => r.id === recipe.id)) {
            savedRecipes.push(recipe);
            localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
            displaySavedRecipes();
        }
        closeModal.call(recipeModal);
    }

    function displaySavedRecipes() {
        savedRecipesContainer.innerHTML = '';
        savedRecipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            savedRecipesContainer.appendChild(recipeCard);
        });
    }

    window.viewSavedRecipe = function(recipeId) {
        const recipe = savedRecipes.find(r => r.id === recipeId);
        displayRecipeDetails(recipe);
        document.getElementById('save-recipe').style.display = 'none';
    };

    window.deleteRecipe = function(recipeId) {
        savedRecipes = savedRecipes.filter(r => r.id !== recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        displaySavedRecipes();
    };

    document.getElementById('add-recipe-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const newRecipe = {
            id: Date.now(),
            title: document.getElementById('recipe-title').value,
            image: document.getElementById('recipe-image').value,
            extendedIngredients: document.getElementById('recipe-ingredients').value.split('\n').map(ingredient => ({ original: ingredient })),
            instructions: document.getElementById('recipe-instructions').value
        };
        savedRecipes.push(newRecipe);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        displaySavedRecipes();
        closeModal.call(addRecipeModal);
    });

    function openAddRecipeModal() {
        addRecipeModal.style.display = 'block';
    }

    function closeModal() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
    }

    displaySavedRecipes();
});

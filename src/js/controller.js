import * as Model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result.
    resultsView.update(Model.getSearchResultsPage());

    // 1. Updating bookmarks view
    bookmarksView.update(Model.state.bookmarks);

    // 2. Loading Recipe
    await Model.loadRecipe(id);

    // 3. Rendering recipe
    recipeView.render(Model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await Model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(Model.getSearchResultsPage());

    // 4) Render intial pagination buttons
    paginationView.render(Model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (pageNum) {
  // 1) Render NEW results
  resultsView.render(Model.getSearchResultsPage(pageNum));

  // 2) Render NEW pagination buttons
  paginationView.render(Model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  Model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(Model.state.recipe);
  recipeView.update(Model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove bookmark
  if (!Model.state.recipe.bookmarked) Model.addBookmark(Model.state.recipe);
  else Model.deleteBookmark(Model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(Model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(Model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(Model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await Model.uploadRecipe(newRecipe);
    console.log(Model.state.recipe);

    // Render recipe
    recipeView.render(Model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(Model.state.bookmarks);

    // Change ID in url
    window.history.pushState(null, '', `#${Model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💩', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome!');
};

init();

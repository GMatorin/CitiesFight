// Link on json file with cities
const endpoint =
  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';

const cities = [];
const searches = document.querySelectorAll('.search');
const suggestions = document.querySelectorAll('.suggestions');
const fightButton = document.getElementById('fight-btn');
const progressSection = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');

// Populatio of the city from first search field
let firstPopulation = 0;
// Populatio of the city from second search field
let secondPopulation = 0;
// Get the cities-info from the API
getCities();

fightButton.addEventListener('click', showResult);
// For each search field display matches on each input in the field
searches.forEach(search => search.addEventListener('input', displayMatches));

// Remove d-none class for ul elements if according search field was clicked
searches.forEach(search =>
  search.addEventListener('click', () =>
    search.nextElementSibling.classList.remove('d-none')
  )
);

// Getting the data of cities
async function getCities() {
  // Wait and get the data
  const response = await fetch(endpoint);
  // Push all cities from the api into the cities array
  cities.push(...(await response.json()));
}
/*
function buttonHandle(e) {
  //suggestions.forEach(suggestion => suggestion.classList.add('d-none'));
  showResult();
}
*/
function showResult() {
  // Variable for results in percents
  let percent = 0;
  // Variable for partial-number results
  let partial = 0;
  // Save values from the search fields
  let firstCity = searches[0].value;
  let secondCity = searches[1].value;
  //.value.split(',')[0];
  firstPopulation = getPopulation(searches[0]);
  secondPopulation = getPopulation(searches[1]);

  percent = Number(firstPopulation) / Number(secondPopulation);
  partial = percent.toFixed(2);
  // Validate the result for later display on the page
  if (percent >= 1) {
    // For weighted visualisation
    percent = 1 / (percent + 1);
    /* Swap cities so that the smaller city will be displayed as partial of the bigger city (see the brogress bar) */
    firstCity = searches[1].value;
    secondCity = searches[0].value;
  } else if (percent <= 1 && percent > 0) {
    // For weighted visualisation
    percent = 1 / (1 / percent + 1);
  } else if (isNaN(percent)) {
    alert('Put correct city names!');
    return;
  }
  // Turn the previously calculated number into percent
  percent = (percent * 100).toFixed(2);
  // Display the progress with cities comparison
  progressSection.classList.remove('d-none');
  progressBar.style.width = `${percent}` + '%';

  // Display the result
  document.querySelector('.first-city').innerText = `${firstCity}`;
  document.querySelector('.second-city').innerText = `${secondCity}`;
  document.querySelector('.results').innerHTML =
    `${searches[0].value}` +
    ' is ' +
    '<span class="text-success">' +
    `${partial}` +
    '</span>' +
    ' sizes of ' +
    `${searches[1].value}`;
}
// This function gets a string to match with array of cities and returns matched results
// Input: wordToMatch - string to match, cities - array of object to match with the first parameter
function findMatches(wordToMatch, cities) {
  // Return only those cities which match the wordToMatch string
  return cities.filter(place => {
    // If there is , sign - search fild has city and state information
    if (wordToMatch.includes(',')) {
      // Split the string into city and state
      const placeArr = [...wordToMatch.split(', ')];
      const cityRegex = new RegExp(placeArr[0], 'gi');
      const stateRegex = new RegExp(placeArr[1], 'gi');
      // Return only a place matching both the city and the state name
      const retArr =
        place.city.match(cityRegex) && place.state.match(stateRegex);
      return retArr;
    } else {
      const cityRegex = new RegExp(wordToMatch, 'gi');
      const retArr = place.city.match(cityRegex);
      return retArr;
    }
  });
}
// Function for displaying number separated with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// This function displays matches found with findMatches function
function displayMatches(e) {
  // Prevent refresh of the suggestions if keyUp or keyDown for navigation is pressed
  if (e.keyCode === 40 || e.keyCode === 38) return false;
  // Get matches
  const matchArray = findMatches(this.value, cities);

  // Build markup out of found matches
  const html = matchArray
    .map(place => {
      const regex = new RegExp(this.value, 'gi');
      const cityName = place.city.replace(
        regex,
        `<span class="hl">${this.value}</span>`
      );
      const stateName = place.state.replace(
        regex,
        `<span class="hl">${this.value}</span>`
      );
      return `
  <li>
    <span class="name">${cityName}, ${stateName}</span>
    <span class="population">${numberWithCommas(place.population)}</span>
  </li>
`;
    })
    .join('');
  // Add navigation for selecting cities with keyboard
  searches.forEach(search =>
    search.addEventListener('keydown', navigateSuggestions)
  );

  // Handle according search field
  if (this.classList.contains('search-1')) {
    // Remove d-none class if the search field wasn't clicked
    suggestions[0].classList.remove('d-none');
    // Add maped results to the markup
    suggestions[0].innerHTML = html;

    if (this.value === '') {
      suggestions[0].classList.add('d-none');
    }
  } else {
    suggestions[1].classList.remove('d-none');
    suggestions[1].innerHTML = html;

    if (this.value === '') {
      suggestions[1].classList.add('d-none');
    }
  }
  const suggestionList = document.querySelectorAll('li');

  suggestionList.forEach(suggestionItem =>
    suggestionItem.addEventListener('click', handleClick)
  );
}

function navigateSuggestions(e) {
  const searchActive = this;
  const ul = this.nextElementSibling;
  let suggestionActive = ul.querySelector('.suggestion-active');
  if (e.keyCode === 40) {
    if (suggestionActive == null) {
      suggestionActive = ul.firstElementChild;
      suggestionActive.classList.add('suggestion-active');
    } else {
      suggestionActive.classList.remove('suggestion-active');
      suggestionActive = suggestionActive.nextElementSibling;
      suggestionActive.classList.add('suggestion-active');
    }

    searchActive.addEventListener('keydown', e =>
      suggestionSelect(e, searchActive, suggestionActive, ul)
    );
  } else if (e.keyCode === 38) {
    if (suggestionActive != null) {
      suggestionActive.classList.remove('suggestion-active');
      suggestionActive = suggestionActive.previousElementSibling;
      suggestionActive.classList.add('suggestion-active');
    }

    searchActive.addEventListener('keydown', e =>
      suggestionSelect(e, searchActive, suggestionActive, ul)
    );
  }
}

function suggestionSelect(e, searchActive, suggestionActive, ul) {
  let cityName = '';
  if (e.keyCode === 13) {
    cityName = toTitleCase(suggestionActive.firstElementChild.innerText);
    searchActive.value = cityName;
    ul.classList.add('d-none');
    /* Deleting the suggestion list */
    ul.innerHTML = ``;
    /*
    if (searchActive.classList.contains('search-1')) {
      firstPopulation = getPopulation(cityName);
    } else {
      secondPopulation = getPopulation(cityName);
    }
*/
    searches.forEach(search =>
      search.removeEventListener('keydown', navigateSuggestions)
    );
  }
  searchActive.removeEventListener('keydown', e =>
    suggestionSelect(e, searchActive, suggestionActive, ul)
  );
}

function getPopulation(search) {
  const cityName = search.value;
  const cityObj = findMatches(cityName, cities);

  if (cityObj.length === 0) {
    // Return NaN as error code
    return NaN;
  } else if (cityObj.length === 1 || cityObj.length > 1) {
    // Make sure that the name of the city is spelled entirely in the search field
    search.value = cityObj[0].city + ', ' + cityObj[0].state;
  }
  return cityObj[0].population;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function handleClick() {
  const ul = this.parentElement;
  if (ul.classList.contains('suggestions-1')) {
    searches[0].value = this.firstElementChild.innerText;
    ul.classList.add('d-none');
  } else {
    searches[1].value = this.firstElementChild.innerText;
    ul.classList.add('d-none');
  }
}

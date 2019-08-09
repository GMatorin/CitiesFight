const endpoint =
  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';

const cities = [];
const searches = document.querySelectorAll('.search');
const suggestions = document.querySelectorAll('.suggestions');
const fightButton = document.getElementById('fight-btn');
const progressSection = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');

let firstPopulation = 0;
let secondPopulation = 0;
/* Get the cities info from the API */
getCities();

fightButton.addEventListener('click', buttonHandle);

searches.forEach(search => search.addEventListener('input', displayMatches));
//searches.forEach(search => search.addEventListener('keyup', displayMatches));
searches.forEach(search =>
  search.addEventListener('click', () =>
    search.nextElementSibling.classList.remove('d-none')
  )
);

/* Getting the data of cities  */
async function getCities() {
  const response = await fetch(endpoint);
  cities.push(...(await response.json()));
}

function buttonHandle(e) {
  suggestions.forEach(suggestion => suggestion.classList.add('d-none'));
  progressSection.classList.remove('d-none');

  showResult();
}

function showResult() {
  let percent = 0;
  let partial = 0;
  let firstCity = '';
  let secondCity = '';

  if (firstPopulation === 0) {
    firstPopulation = getPopulation(searches[0].value);
  }
  if (secondPopulation === 0) {
    secondPopulation = getPopulation(searches[1].value);
  }

  partial = Number(firstPopulation) / Number(secondPopulation);
  percent = partial;
  if (percent >= 1) {
    percent = 1 / percent;
    firstCity = searches[1].value;
    secondCity = searches[0].value;
  } else {
    //percent = 1 - percent;
    firstCity = searches[0].value;
    secondCity = searches[1].value;
  }
  percent = (percent * 100).toFixed(2);
  partial = partial.toFixed(2);

  progressBar.style.width = `${percent}` + '%';

  document.querySelector('.first-city').innerText = `${firstCity}`;
  document.querySelector('.second-city').innerText = `${secondCity}`;
  document.querySelector('.results').innerText =
    `${searches[0].value}` +
    ' is ' +
    `${partial}` +
    ' sizes of ' +
    `${searches[1].value}`;
}

function findMatches(wordToMatch, cities) {
  return cities.filter(place => {
    // here we need to return only a city which is matching with the searched word
    const regex = new RegExp(wordToMatch, 'gi');
    return place.city.match(regex);
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function displayMatches(e) {
  // Prevent refresh of the suggestions if keyUp or keyDown for navigation is pressed
  if (e.keyCode === 40 || e.keyCode === 38) return false;
  const matchArray = findMatches(this.value, cities);

  const html = matchArray
    .map(place => {
      const regex = new RegExp(this.value, 'gi');
      const cityName = place.city.replace(
        regex,
        `<span class="hl">${this.value}</span>`
      );
      return `
  <li>
    <span class="name">${cityName}</span>
    <span class="population">${numberWithCommas(place.population)}</span>
  </li>
`;
    })
    .join('');

  searches.forEach(search =>
    search.addEventListener('keydown', navigateSuggestions)
  );
  if (this.classList.contains('search-1')) {
    suggestions[0].classList.remove('d-none');
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
}

function navigateSuggestions(e) {
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
  } else if (e.keyCode === 38) {
    if (suggestionActive != null) {
      suggestionActive.classList.remove('suggestion-active');
      suggestionActive = suggestionActive.previousElementSibling;
      suggestionActive.classList.add('suggestion-active');
    }
  }
  suggestionActive.addEventListener(
    'keydown',
    suggestionSelect(e, this, suggestionActive, ul)
  );
}

function suggestionSelect(e, searchActive, suggestionActive, ul) {
  let cityName = '';
  if (e.keyCode === 13) {
    cityName = toTitleCase(suggestionActive.firstElementChild.innerText);
    searchActive.value = cityName;
    ul.classList.add('d-none');

    if (searchActive.classList.contains('search-1')) {
      firstPopulation = getPopulation(cityName);
    } else {
      secondPopulation = getPopulation(cityName);
    }
  }

  searchActive.removeEventListener(
    'keydown',
    suggestionSelect(e, searchActive, suggestionActive)
  );
}

function getPopulation(cityName) {
  const cityObj = findMatches(cityName, cities);

  return cityObj[0].population;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

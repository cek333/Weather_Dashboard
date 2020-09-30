let searchTerms; // array of search terms
let lastSearchIdx; // index of last term searched
let weatherReports; // array of weather reports; 
  // For each search term there will be a related entry in weatherReports
  // at the same index.

// Compute dates for 5 day forcast
let now = Date.now();
let oneDay = 24*60*60*1000; // milliseconds in one day
let day0, day1, day2, day3, day4, day5, dateStr;
for (let cnt = 0; cnt <= 5; cnt++) {
  dateStr = new Date(now + (oneDay * cnt)).toLocaleDateString();
  switch (cnt) {
    case 0: day0 = dateStr;
    case 1: day1 = dateStr;
    case 2: day2 = dateStr;
    case 3: day3 = dateStr;
    case 4: day4 = dateStr;
    case 5: day5 = dateStr;
  }
}

// initialize list of search terms from localStorage
let tmp = localStorage.getItem('wAppSearchTerms');
if (tmp == null) {
  searchTerms = [];
} else {
  searchTerms = JSON.parse(tmp);
  // populate search list
  for (let idx=0; idx < searchTerms.length; idx++) {
    let btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('list-group-item', 'list-group-item-action');
    btn.innerHTML = searchTerms[idx];
    document.querySelector('.list-group').appendChild(btn);
  }
}

tmp = localStorage.getItem('wAppLastSearchIdx');
if (tmp == null) {
  lastSearchIdx = -1;
} else {
  lastSearchIdx = Number(tmp);
}

tmp = localStorage.getItem('wAppWeatherReports');
if (tmp == null) {
  weatherReports = [];
} else {
  weatherReports = JSON.parse(tmp);
}

function fetchCityWeather(searchTerm, idx) {
  // Do API call for fresh data
}

function retrieveCityWeather() {
  // check if 10min has passed since data saved
}

function findCityWeather() {
  let newSearchTerm = document.getElementById('search-term').value;
  // check if user has repeated a previous search
  let idx = searchTerms.indexOf(newSearchTerm);
  if (idx >= 0 ) {
    // item exists
    lastSearchIdx = idx;
    retrieveCityWeather();
  } else {
    // fresh search
    fetchCityWeather(newSearchTerm, -1);
  }
}

// add event listeners
document.getElementById('search').addEventListener('click', findCityWeather);

let searchTerms; // array of search terms
let lastSearchIdx; // index of last term searched
let weatherReports; // array of weather reports; 
  // For each search term there will be a related entry in weatherReports
  // at the same index.

// Compute dates for 5 day forcast
let now = Date.now();
let oneDay = 24*60*60*1000; // milliseconds in one day
let dateStr;
let day = [];
for (let cnt = 0; cnt <= 5; cnt++) {
  dateStr = new Date(now + (oneDay * cnt)).toLocaleDateString();
  day.push(dateStr);
}

// initialize list of search terms from localStorage
let tmp = localStorage.getItem('wAppSearchTerms');
if (tmp == null) {
  searchTerms = [];
} else {
  searchTerms = JSON.parse(tmp);
  // populate search list
  for (let idx=0; idx < searchTerms.length; idx++) {
    addItemToSearchList( searchTerms[idx] );
  }
}

tmp = localStorage.getItem('wAppWeatherReports');
if (tmp == null) {
  weatherReports = [];
} else {
  weatherReports = JSON.parse(tmp);
}

tmp = localStorage.getItem('wAppLastSearchIdx');
if (tmp == null) {
  lastSearchIdx = -1;
  // No previous searches; hide display
  document.querySelector('main').style.display = "none";
} else {
  lastSearchIdx = Number(tmp);
  // Initialize display with last searched city
  retrieveCityWeather();
}

function addItemToSearchList( searchTerm ) {
  let btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.classList.add('list-group-item', 'list-group-item-action');
  btn.innerHTML = searchTerm;
  document.querySelector('.list-group').appendChild(btn);
}

function displayCityWeather() {
  for (let idx=0; idx <= 5; idx++) {
    document.getElementById(`day${idx}`).innerHTML = day[idx];
    document.getElementById(`temp-day${idx}`).innerHTML = weatherReports[lastSearchIdx].forecast[idx].temp;
    document.getElementById(`hum-day${idx}`).innerHTML = weatherReports[lastSearchIdx].forecast[idx].humidity;
    document.getElementById(`icon-day${idx}`)
      .setAttribute('src', `assets/images/${weatherReports[lastSearchIdx].forecast[idx].icon}_2x.png`);
  }
  document.getElementById('wind').innerHTML = weatherReports[lastSearchIdx].wind;
  document.getElementById('city').innerHTML = weatherReports[lastSearchIdx].displayName;
  let uvBadge = document.getElementById('uv');
  let uvVal = Number(weatherReports[lastSearchIdx].uv);
  uvBadge.innerHTML = uvVal;

  if (uvVal <= 2) {
    uvBadge.classList.add('uv-low');
  } else if (uvVal <= 5) {
    uvBadge.classList.add('uv-moderate');
  } else if (uvVal <= 7) {
    uvBadge.classList.add('uv-high');
  } else if (uvVal <= 10) {
    uvBadge.classList.add('uv-very-high');
  } else {
    uvBadge.classList.add('uv-extreme');
  }
}

async function fetchCityWeather(searchTerm, sidx) {
  // Do API call for fresh data
  // For now, pull data from local storage for debugging

  /* Save subset of info in new report object literal with the following format:
      forecast: [ {temp: xx, humidity: xx, icon: xx}, ... ]
      wind: xx,
      uv: xx,
      time: xx,
      searchTerm: xx,
      displayName: xx
  */
  let lat, lon; 
  let newReport = { forecast: [] };
  let tempHumIcon = { };
  
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&units=metric&APPID=${APPID}`;
  let response = await fetch(url);
  if (!response.ok) {
    document.getElementById('warning').innerHTML = `An error occured: ${response.status}`;
    return;
  }
  let weather = await response.json();
  // console.log(`[fetchCityWeather] weather:`, weather);
  // dbg: let weather = JSON.parse(localStorage.getItem('weather'));
  // dbg: newReport.displayName = searchTerm;
  newReport.searchTerm = searchTerm;
  newReport.displayName = weather.name;
  newReport.wind = weather.wind.speed;
  newReport.time = Date.now();
  lat = weather.coord.lat;
  lon = weather.coord.lon;

  tempHumIcon.temp = weather.main.temp;
  tempHumIcon.humidity = weather.main.humidity;
  tempHumIcon.icon = weather.weather[0].icon;
  newReport.forecast.push(tempHumIcon);

  // Get the 5 day forcast
  url = `http://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&units=metric&APPID=${APPID}`;
  response = await fetch(url);
  if (!response.ok) {
    document.getElementById('warning').innerHTML += `An error occured: ${response.status}`;
    return;
  }
  let forecast = await response.json();
  // console.log(`[fetchCityWeather] forecast:`, forecast);  
  // dbg: let forecast = JSON.parse(localStorage.getItem('forecast'));
  // Search for first mid-day temperature
  let idx, jdx;
  for (idx=0; idx < forecast.list.length; idx++) {
    if ((forecast.list[idx].dt_txt).indexOf("12:00:00") > 0) {
      break;
    }
  }
  // forecast are every 3hrs, so mid-day entries are 8 indicies apart
  for (jdx=idx; jdx < 40; jdx+=8) {
    tempHumIcon = {};
    tempHumIcon.temp = forecast.list[jdx].main.temp;
    tempHumIcon.humidity = forecast.list[jdx].main.humidity;
    tempHumIcon.icon = forecast.list[jdx].weather[0].icon;
    newReport.forecast.push(tempHumIcon);
  }

  // get uv
  url = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&APPID=${APPID}`
  response = await fetch(url);
  if (!response.ok) {
    document.getElementById('warning').innerHTML += `An error occured: ${response.status}`;
    return;
  }
  let uv = await response.json();
  // console.log(`[fetchCityWeather] uv:`, uv);  
  // dbg: let uv = JSON.parse(localStorage.getItem('uv'));
  newReport.uv = uv.value;

  if (sidx >= 0) {
    weatherReports[lastSearchIdx] = newReport;
  } else {
    // If this is the very first search (lastSearchIdx=-1), then enable the display
    if (lastSearchIdx==-1) {
      document.querySelector('main').style.display = "block";
    }

    weatherReports.push(newReport);
    searchTerms.push(searchTerm);
    lastSearchIdx = searchTerms.length - 1;

    // Add searchTerm to search list
    addItemToSearchList( searchTerm );
    // Update search list in local storage
    localStorage.setItem('wAppSearchTerms', JSON.stringify(searchTerms));
  }
  // Update items in local storage
  localStorage.setItem('wAppLastSearchIdx', `${lastSearchIdx}`);
  localStorage.setItem('wAppWeatherReports', JSON.stringify(weatherReports));
  console.log(`[fetchCityWeather] Fetch data from API for ${searchTerms[lastSearchIdx]}.`);

  displayCityWeather();
}

function retrieveCityWeather() {
  // Check if 10min has passed since data saved
  let now = Date.now();
  let then = weatherReports[lastSearchIdx].time;
  // console.log(`[retrieveCityWeather] now:${now}, then:${then}, diff(min):${Math.floor((now-then)/(60*1000))}`);
  // Find diff btw 'now' and 'then' in minutes
  if (Math.floor((now-then)/(60*1000)) > 10) {
    console.log(`[retrieveCityWeather] Stored data is old. Get fresh data for ${searchTerms[lastSearchIdx]}.`);
    fetchCityWeather(searchTerms[lastSearchIdx], lastSearchIdx);
  } else {
    console.log(`[retrieveCityWeather] Retrieve data from storage for ${searchTerms[lastSearchIdx]}.`);
    // Update last search index in storage
    localStorage.setItem('wAppLastSearchIdx', `${lastSearchIdx}`);
    displayCityWeather();
  }
}

function findCityWeather() {
  // clear any previous warning messages
  document.getElementById('warning').innerHTML = "";
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

function repeatCitySearch( event ) {
  // clear any previous warning messages
  document.getElementById('warning').innerHTML = "";
  let oldSearchTerm = event.target.innerHTML;
  lastSearchIdx = searchTerms.indexOf(oldSearchTerm);
  retrieveCityWeather();
}

// add event listeners
document.getElementById('search').addEventListener('click', findCityWeather);
document.querySelector('.list-group').addEventListener('click', repeatCitySearch)
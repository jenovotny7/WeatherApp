var cityList = [];
var searchBoxEl = document.querySelector("#city-search");
var todayWeatherEl = document.querySelector(".today-display")
var historyContainer = document.querySelector(".search-list")
var dailyContainer = document.querySelector(".fiveDay-display")


//Main city search function
var searchSubmitHandler = function(event) {
    event.preventDefault();
    var cityEntered = document.querySelector("input").value;
    searchBoxEl.reset();
    retrieveWeather(cityEntered);
};

//Main Search List function 
var previousSubmitted = function(event) {
    var targetEl = event.target;
    if (targetEl.matches(".list-group-item")) {
        var cityName = targetEl.textContent;
        retrieveWeather(cityName);
    }
};




//Main function for retrieving Data from OpenWeather.org
var retrieveWeather = function(realName) {
    var apiLink = `https://api.openweathermap.org/data/2.5/weather?q=${realName}&units=imperial&appid=a6db5817d1173c9477cc315b843e5257`;
    fetch(apiLink).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
              pullUV(data);
              pullDailyWeather(data);
          });
        } else {
          alert("Error: " + response.statusText);
        }
      });
};

var pullUV = function(cityUV) {
    var lat = cityUV.coord.lat;
    var lon = cityUV.coord.lon;
    var apiLink = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=a6db5817d1173c9477cc315b843e5257`;
    fetch(apiLink).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
              showCurrent(cityUV, data);
          });
        } else {
          alert("Eh, wrong " + response.statusText);
        }
      });
};

var pullDailyWeather = function(cityDaily) {
    var lat = cityDaily.coord.lat;
    var lon = cityDaily.coord.lon;
    var apiLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current&units=imperial&appid=a6db5817d1173c9477cc315b843e5257`;
    fetch(apiLink).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
              showDaily(data);
          });
        } else {
          alert("Eh, wrong " + response.statusText);
        }
    });
};






var showCurrent = function(city, uv) {
    todayWeatherEl.innerHTML = "";
    var today = moment.unix(city.dt).format("(M/DD/YYYY)");
    var cityTitleEl = document.createElement("h5");
    cityTitleEl.classList = "card-title";
    cityTitleEl.innerHTML = `${city.name} ${today} <img src="https://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png">`;
    todayWeatherEl.appendChild(cityTitleEl);

    //temp
    var tEl = document.createElement("p");
    tEl.innerHTML = `Temperature: ${city.main.temp} &deg;F`;
    todayWeatherEl.appendChild(tEl);

    // humidity
    var hEl = document.createElement("p");
    hEl.innerHTML = `Humidity: ${city.main.humidity}%`;
    todayWeatherEl.appendChild(hEl);

    // wind
    var wEl = document.createElement("p");
    wEl.innerHTML = `Wind Speed: ${city.wind.speed} MPH`;
    todayWeatherEl.appendChild(wEl);

    // uv
    var uvEl = document.createElement("p");
    uvEl.innerHTML = "UV Index: ";
    var uvBadge = document.createElement("span");
    uvBadge.innerHTML = uv.value;
    uvEl.appendChild(uvBadge);
    if (uv.value < 2) {
        uvBadge.classList = "badge bg-danger";
    }
    else if (uv.value >= 2 && uv.value < 8) {
        uvBadge.classList = "badge bg-success";
    }
    else if (uv.value >= 9) {
        uvBadge.classList = "badge bg-primary";
    };
    todayWeatherEl.appendChild(uvEl);

    //add displayed city to history
    newHistory(city.name);
};

var showDaily = function(dailyWeather) {
    dailyContainer.innerHTML = "";
    for (i=0; i < 5; i++) {
        var date = moment.unix(dailyWeather.daily[i].dt).format("(M/DD/YYYY)");
        var image = `https://openweathermap.org/img/wn/${dailyWeather.daily[i].weather[0].icon}@2x.png`
        var cardContainer = document.createElement("div");
        cardContainer.classList = "card col mx-4 bg-danger text-white";
        dailyContainer.appendChild(cardContainer);
        var cardBody = document.createElement("div");
        cardBody.classList = "card-body";
        cardBody.innerHTML = `<h4 class="card-title">${date}</h4><img src="${image}"><p>Temp: ${dailyWeather.daily[i].temp.day} &deg;F</p><p>Humidity: ${dailyWeather.daily[i].humidity}%</p>`;
        cardContainer.appendChild(cardBody);
    };
}; 

var newHistory = function(city) {
   
    if (cityList.indexOf(city) !== -1) {
        return;
    }
    else {
      
        var historyEl = document.createElement("li");
        historyEl.classList = "list-group-item";
        historyEl.innerHTML = city;
        historyContainer.appendChild(historyEl);
        cityList.push(city);
        localStorage.setItem("historyList", JSON.stringify(cityList));
    }
};   

var uploadHistory = function() {
    if (window.localStorage.length < 1) {
        return;
    }
    else {
        var history = localStorage.getItem("historyList");
        history = JSON.parse(history);
        cityList = history;
        for (i = 0; i < cityList.length; i++) {
            var historyEl = document.createElement("li");
            historyEl.classList = "list-group-item";
            historyEl.innerHTML = cityList[i];
            historyContainer.appendChild(historyEl);
        }
    }
};






// Event Listener functions 
searchBoxEl.addEventListener("submit", searchSubmitHandler);
historyContainer.addEventListener("click", previousSubmitted);

uploadHistory();
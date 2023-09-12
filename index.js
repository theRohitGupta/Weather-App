const locationTab = document.querySelector("[data-userCoordinatesWeather]");
const searchTab = document.querySelector("[data-userCityWeather]");

const infoContainer = document.querySelector(".weatherContainer");
const grantAccessContainer = document.querySelector("#grantLocationAccessPage");
const loadingScreenContainer = document.querySelector("#loadingScreenPage");
const coordinatesContainer = document.querySelector("#coordinatesPage");
const searchCityContainer = document.querySelector(".form-container");
const notFoundContainer = document.querySelector(".notFound");

// INITIAL VARIABLES
let currentTab = locationTab;
// CURRENT TAB ADDING CLASS ACTIVE
currentTab.classList.add("current-tab");
getFromSessionStorage();

// TAB SWITCHING
locationTab.addEventListener('click', () => {
    switchTab(locationTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchCityContainer.classList.contains("active")){
            grantAccessContainer.classList.remove("active");
            coordinatesContainer.classList.remove("active");
            searchCityContainer.classList.add("active");
        }else{
            searchCityContainer.classList.remove("active");
            coordinatesContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

// CHECK IF COORDINATES ARE PRESENT IN SESSION STORAGE
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;

    grantAccessContainer.classList.remove("active");
    loadingScreenContainer.classList.add("active");

    // API CALL
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`);
        const data = await res.json();
        if(res?.status == "404")
            throw err;
        loadingScreenContainer.classList.remove("active");
        coordinatesContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err){
        loadingScreenContainer.classList.remove("active");
        coordinatesContainer.classList.remove("active");
        notFoundContainer.classList.add("active");
    }
}

function renderWeatherInfo(weatherInfo){
    // FETCHING ELEMENTS
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temperature]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");


    // FETCHING VALUES FROM WEATHER DATA AND INSERTING IN UI ELEMENTS
    cityName.textContent = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.textContent = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.textContent = `${weatherInfo?.main?.temp} °C`;
    windspeed.textContent = `${weatherInfo?.wind?.speed} m/s`;
    humidity.textContent = `${weatherInfo?.main?.humidity} %`;
    cloudiness.textContent = `${weatherInfo?.clouds?.all} %`;
}

// GRANT ACCESS BTN EVENT LISTENER
const grantAccessBtn = document.querySelector("[data-grantLocationAccess]");
grantAccessBtn.addEventListener('click',getLocation);

// GETTING LOCATION
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert("NO GEOLOCATION SUPPORT AVAILBLE");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


// SEARCH WEATHER BY CITY NAME
let searchInput = document.querySelector("[data-searchInput]");

searchCityContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return;
    else    
        fetchSearchWeatherInfo(cityName);
    searchInput.value = '';
});

async function fetchSearchWeatherInfo(city){
    loadingScreenContainer.classList.add("active");
    coordinatesContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        if(res?.status == "404")
            throw err;
        loadingScreenContainer.classList.remove("active");
        coordinatesContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err){
        loadingScreenContainer.classList.remove("active");
        coordinatesContainer.classList.remove("active");
        notFoundContainer.classList.add("active");
    }
}



/* =========================================
   НАСТРОЙКИ
========================================= */

const themeButton = document.getElementById("themeButton");

const teaButton = document.getElementById("teaButton");
const teaCount = document.getElementById("teaCount");

const weatherIcon = document.getElementById("weatherIcon");
const weatherText = document.getElementById("weatherText");

const snowContainer = document.getElementById("snow");
const rainContainer = document.getElementById("rain");


/* =========================================
   1. ТЕМА ДЕНЬ / НОЧЬ
========================================= */

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    if (isDark) {

        themeButton.textContent = "🌙";

    } else {

        themeButton.textContent = "☀️";

    }

});


/* =========================================
   2. СЧЁТЧИК ЧАЮ
========================================= */

let tea = Number(
    localStorage.getItem("teaCount")
) || 0;

teaCount.textContent = tea;


teaButton.addEventListener("click", () => {

    tea++;

    teaCount.textContent = tea;

    localStorage.setItem(
        "teaCount",
        tea
    );

});


/* =========================================
   3. СОЗДАНИЕ СНЕГА
========================================= */

function createSnow() {

    snowContainer.innerHTML = "";

    const amount = 50;

    for (let i = 0; i < amount; i++) {

        const snowflake =
            document.createElement("div");

        snowflake.classList.add("snowflake");

        snowflake.textContent = "❄";

        snowflake.style.left =
            Math.random() * 100 + "%";

        snowflake.style.fontSize =
            Math.random() * 15 + 10 + "px";

        snowflake.style.animationDuration =
            Math.random() * 5 + 5 + "s";

        snowflake.style.animationDelay =
            Math.random() * 5 + "s";

        snowContainer.appendChild(
            snowflake
        );

    }

}


/* =========================================
   4. ВИДАЛЕНЯ СНЕГА
========================================= */

function removeSnow() {

    snowContainer.innerHTML = "";

}


/* 
   5. СОЗДАНИЕ ДОЖДЯ
 */

function createRain() {

    rainContainer.innerHTML = "";

    const amount = 70;

    for (let i = 0; i < amount; i++) {

        const drop =
            document.createElement("div");

        drop.classList.add("raindrop");

        drop.style.left =
            Math.random() * 100 + "%";

        drop.style.animationDuration =
            Math.random() * 1 + 0.5 + "s";

        drop.style.animationDelay =
            Math.random() * 2 + "s";

        rainContainer.appendChild(drop);

    }

}


/* 
   6. видаленя ДОЖДЯ
 */

function removeRain() {

    rainContainer.innerHTML = "";

}


/* 
   7. ПОГОДА
= */

async function getWeather() {

    try {

        /*
         * Получаем примерное местоположение
         * по IP
         */

        const locationResponse =
            await fetch(
                "https://ipapi.co/json/"
            );

        const location =
            await locationResponse.json();


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;

        const city =
            location.city;


        /*
         * Получаем погоду
         * 
         */

        const weatherResponse =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
            );

        const weather =
            await weatherResponse.json();


        const temperature =
            weather.current.temperature_2m;

        const weatherCode =
            weather.current.weather_code;


        /*
         * Вибираем состояние погоди
         */

        updateWeather(
            weatherCode,
            temperature,
            city
        );

    }

    catch (error) {

        console.error(
            "Помилка отримання погоди:",
            error
        );

        weatherText.textContent =
            "Не вдалося отримати погоду";

    }

}


/* 
   8. ОПРЕДЕЛЕНИЕ ПОГОДи
*/

function updateWeather(
    code,
    temperature,
    city
) {

    removeSnow();
    removeRain();


    /*
     * Ясно
     */

    if (code === 0) {

        weatherIcon.textContent = "☀️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

    }


    /*
     * Облачно
     */

    else if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        weatherIcon.textContent = "🌤️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

    }


    /*
     * Туман
     */

    else if (
        code === 45 ||
        code === 48
    ) {

        weatherIcon.textContent = "🌫️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

    }


    /*
     * Дождь
     */

    else if (
        code >= 51 &&
        code <= 67
    ) {

        weatherIcon.textContent = "🌧️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

        createRain();

    }


    /*
     * Снгі
     */

    else if (
        code >= 71 &&
        code <= 86
    ) {

        weatherIcon.textContent = "❄️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

        createSnow();

    }


    /*
     * Гроза
     */

    else if (
        code >= 95
    ) {

        weatherIcon.textContent = "⛈️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

    }


    /*
     * 
     */

    else {

        weatherIcon.textContent = "🌤️";

        weatherText.textContent =
            `${city}: ${temperature}°C`;

    }

}


/* 
   9. ЗАПУСК */

getWeather();
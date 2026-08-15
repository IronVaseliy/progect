/* =========================================
   НАСТРОЙКИ
========================================= */

const themeButton =
    document.getElementById("themeButton");

const teaButton =
    document.getElementById("teaButton");

const teaCount =
    document.getElementById("teaCount");

const weatherStatus =
    document.getElementById("weatherStatus");

const weatherTemperature =
    document.getElementById("weatherTemperature");

const weatherCity =
    document.getElementById("weatherCity");

const weatherIcon =
    document.getElementById("weatherIcon");

const weatherText =
    document.getElementById("weatherText");

const snowContainer =
    document.getElementById("snow");

const rainContainer =
    document.getElementById("rain");

const cupVolume =
    document.getElementById("cupVolume");

const volumeUnit =
    document.getElementById("volumeUnit");


/* =========================================
   1. ТЕМА ДЕНЬ / НІЧ
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
   2. ФОРМАТУВАННЯ ОБ'ЄМУ
========================================= */

function formatVolume(ml) {

    if (ml >= 1000) {

        return `${(ml / 1000).toFixed(2)} л`;

    }

    return `${ml} мл`;
}


/* =========================================
   3. ЗАВАНТАЖЕННЯ ЛІЧИЛЬНИКА
========================================= */

let tea =
    Number(
        localStorage.getItem("teaCount")
    ) || 0;


teaCount.textContent =
    formatVolume(tea);


/* =========================================
   4. ДОДАВАННЯ ЧАЮ
========================================= */

teaButton.addEventListener("click", () => {

    let volume =
        Number(cupVolume.value);

    const unit =
        volumeUnit.value;


    /* Перевірка */

    if (!volume || volume <= 0) {

        alert(
            "Вкажіть правильний об'єм чашки!"
        );

        return;
    }


    /* Літри переводимо в мілілітри */

    if (unit === "l") {

        volume =
            volume * 1000;
    }


    /* Додаємо до загальної кількості */

    tea += volume;


    /* Оновлюємо текст */

    teaCount.textContent =
        formatVolume(tea);


    /* Зберігаємо */

    localStorage.setItem(
        "teaCount",
        tea
    );

});


/* =========================================
   5. СТВОРЕННЯ СНІГУ
========================================= */

function createSnow() {

    snowContainer.innerHTML = "";

    const amount = 50;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const snowflake =
            document.createElement("div");


        snowflake.classList.add(
            "snowflake"
        );


        snowflake.textContent =
            "❄";


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
   6. ВИДАЛЕННЯ СНІГУ
========================================= */

function removeSnow() {

    snowContainer.innerHTML = "";

}


/* =========================================
   7. СТВОРЕННЯ ДОЩУ
========================================= */

function createRain() {

    rainContainer.innerHTML = "";

    const amount = 70;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const drop =
            document.createElement("div");


        drop.classList.add(
            "raindrop"
        );


        drop.style.left =
            Math.random() * 100 + "%";


        drop.style.animationDuration =
            Math.random() * 1 + 0.5 + "s";


        drop.style.animationDelay =
            Math.random() * 2 + "s";


        rainContainer.appendChild(
            drop
        );

    }

}


/* =========================================
   8. ВИДАЛЕННЯ ДОЩУ
========================================= */

function removeRain() {

    rainContainer.innerHTML = "";

}


/* =========================================
   9. ОТРИМАННЯ ПОГОДИ
========================================= */

async function getWeather() {

    try {

        /*
         * Визначаємо приблизне
         * місцезнаходження по IP
         */

        const locationResponse =
            await fetch(
                "https://ipapi.co/json/"
            );


        if (!locationResponse.ok) {

            throw new Error(
                "Не вдалося отримати місцезнаходження"
            );
        }


        const location =
            await locationResponse.json();


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;

        const city =
            location.city || "Ваше місто";


        /*
         * Отримуємо погоду
         */

        const weatherResponse =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "Не вдалося отримати погоду"
            );
        }


        const weather =
            await weatherResponse.json();


        const temperature =
            weather.current.temperature_2m;


        const weatherCode =
            weather.current.weather_code;


        /*
         * Оновлюємо погоду
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


        weatherIcon.textContent =
            "🌤️";


        weatherText.textContent =
            "Не вдалося отримати погоду";

    }

}function updateWeather(
    code,
    temperature,
    city
) {

    removeSnow();

    removeRain();


    /* ЯСНО */

    if (code === 0) {

        weatherIcon.textContent = "☀️";

        weatherStatus.textContent = "Ясно";

        weatherText.textContent = "Чисте небо";

    }


    /* ХМАРНО */

    else if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        weatherIcon.textContent = "🌤️";

        weatherStatus.textContent = "Хмарно";

        weatherText.textContent = "Мінлива хмарність";

    }


    /* ТУМАН */

    else if (
        code === 45 ||
        code === 48
    ) {

        weatherIcon.textContent = "🌫️";

        weatherStatus.textContent = "Туман";

        weatherText.textContent = "Видимість знижена";

    }


    /* ДОЩ */

    else if (
        code >= 51 &&
        code <= 67
    ) {

        weatherIcon.textContent = "🌧️";

        weatherStatus.textContent = "Дощ";

        weatherText.textContent = "Опади";

        createRain();

    }


    /* СНІГ */

    else if (
        code >= 71 &&
        code <= 86
    ) {

        weatherIcon.textContent = "❄️";

        weatherStatus.textContent = "Сніг";

        weatherText.textContent = "Снігопад";

        createSnow();

    }


    /* ГРОЗА */

    else if (code >= 95) {

        weatherIcon.textContent = "⛈️";

        weatherStatus.textContent = "Гроза";

        weatherText.textContent = "Гроза";

    }


    /* ІНШЕ */

    else {

        weatherIcon.textContent = "🌤️";

        weatherStatus.textContent = "Погода";

        weatherText.textContent = "Невідомо";

    }


    /* Температура */

    weatherTemperature.textContent =
        Math.round(temperature);


    /* Місто */

    weatherCity.textContent =
        city;
}



/* =========================================
   11. ЗАПУСК ПОГОДИ
========================================= */

getWeather();
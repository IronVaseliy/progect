/* =========================================
   НАСТРОЙКИ
========================================= */

const themeButton =
    document.getElementById("themeButton");

const teaButton =
    document.getElementById("teaButton");

const teaCount =
    document.getElementById("teaCount");

const weatherIcon =
    document.getElementById("weatherIcon");

const weatherText =
    document.getElementById("weatherText");

const weatherStatus =
    document.getElementById("weatherStatus");

const weatherTemperature =
    document.getElementById("weatherTemperature");

const weatherCity =
    document.getElementById("weatherCity");

const snowContainer =
    document.getElementById("snow");

const rainContainer =
    document.getElementById("rain");

const cupVolume =
    document.getElementById("cupVolume");

const volumeUnit =
    document.getElementById("volumeUnit");


/* Статистика */

const monthStat =
    document.getElementById("monthStat");

const sixMonthsStat =
    document.getElementById("sixMonthsStat");

const yearStat =
    document.getElementById("yearStat");

/* Калькулятор власного прогнозу */
const customPeriodInput = document.getElementById("customPeriodInput");
const customPeriodUnit = document.getElementById("customPeriodUnit");
const customForecastValue = document.getElementById("customForecastValue");    

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
   2. ФОРМАТ ОБ'ЄМУ
========================================= */

function formatVolume(ml) {

    if (ml >= 1000) {

        return `${(ml / 1000).toFixed(2)} л`;

    }

    return `${Math.round(ml)} мл`;
}
/* =========================================
   ДАТА
========================================= */

function getDateKey(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   СЧЁТЧИК ЗА СЬОГОДНІ
========================================= */

const today = getDateKey();

const savedTeaDate =
    localStorage.getItem("teaCountDate");

let tea = 0;


if (savedTeaDate === today) {

    tea =
        Number(
            localStorage.getItem("teaCount")
        ) || 0;

} else {

    tea = 0;

    localStorage.setItem(
        "teaCount",
        "0"
    );

    localStorage.setItem(
        "teaCountDate",
        today
    );
}


teaCount.textContent =
    formatVolume(tea);
/* =========================================
   4. ІСТОРІЯ ВИПИТОГО ЧАЮ
========================================= */

/*
    Тут зберігаємо приблизно так:

    [
        {
            date: "2026-08-20",
            volume: 250
        },

        {
            date: "2026-08-20",
            volume: 300
        }
    ]
*/

let teaHistory =
    JSON.parse(
        localStorage.getItem("teaHistory")
    ) || [];


/* =========================================
   5. ОТРИМАННЯ ДАТИ
========================================= */




/* =========================================
   6. ДОДАВАННЯ ЧАЮ
========================================= */

/* =========================================
   6. ДОДАВАННЯ ЧАЮ
========================================= */

teaButton.addEventListener("click", function () {

    // Беремо значення чашки
    let volume = Number(cupVolume.value);

    // Перевірка
    if (!Number.isFinite(volume) || volume <= 0) {
        alert("Вкажіть правильний об'єм чашки!");
        return;
    }

    // Якщо літри — переводимо в мл
    if (volumeUnit.value === "l") {
        volume *= 1000;
    }

    // ОДНЕ натискання = ОДНА чашка
    tea = Number(tea) || 0;
    tea += volume;

    // Показуємо результат
    teaCount.textContent = formatVolume(tea);

    // Зберігаємо сьогоднішню кількість
    localStorage.setItem("teaCount", tea);
    localStorage.setItem("teaCountDate", getDateKey());


    // Додаємо тільки ОДИН запис в історію
    teaHistory.push({
        date: getDateKey(),
        volume: volume
    });

    localStorage.setItem(
        "teaHistory",
        JSON.stringify(teaHistory)
    );

    checkQuests();


    // Оновлюємо статистику
    updateStatistics();

    // Оновлюємо графік
    updateTeaChart();

});


/* =========================================
   ГРАФІК ЗА ОСТАННІ 7 ДНІВ
========================================= */

function updateTeaChart() {

    const chartArea = document.getElementById("chartArea");
    const chartTotal = document.getElementById("chartTotal");

    if (!chartArea) return;

    chartArea.innerHTML = "";

    const history = JSON.parse(localStorage.getItem("teaHistory")) || [];

    /* Останні 7 днів */
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
            key: getDateKey(date),
            date: date,
            volume: 0
        });
    }

    /* Знаходимо чай за кожен день */
    history.forEach(item => {
        const day = days.find(d => d.key === item.date);
        if (day) {
            day.volume += Number(item.volume) || 0;
        }
    });

    /* 👈 ВИПРАВЛЕНО: Максимальне значення 2000 мл (відповідає шкалі 2 л у HTML) */
    const maxVolume = Math.max(...days.map(d => d.volume), 2000);

    /* Загальна кількість */
    const total = days.reduce((sum, day) => sum + day.volume, 0);
    chartTotal.textContent = formatVolume(total);

    /* Створюємо стовпчики */
    days.forEach(day => {
        const column = document.createElement("div");
        column.className = "chart-column";

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        /* Висота */
        const height = (day.volume / maxVolume) * 100;
        bar.style.height = `${Math.max(height, 2)}%`;

        /* Значення */
        const value = document.createElement("span");
        value.className = "chart-value";
        value.textContent = formatVolume(day.volume);

        /* День */
        const dayName = document.createElement("span");
        dayName.className = "chart-day";
        dayName.textContent = day.date.toLocaleDateString("uk-UA", { weekday: "short" });

        bar.appendChild(value);
        column.appendChild(bar);
        column.appendChild(dayName);
        chartArea.appendChild(column);
    });

}


/* =========================================
   7. ПОЧАТОК ПОТОЧНОГО МІСЯЦЯ
========================================= */

function getStartOfMonth() {

    const now =
        new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );
}


/* =========================================
   8. ПОЧАТОК 6 МІСЯЦІВ
========================================= */

function getStartOfSixMonths() {

    const now =
        new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1
    );
}


/* =========================================
   9. ПОЧАТОК РОКУ
========================================= */

function getStartOfYear() {

    const now =
        new Date();

    return new Date(
        now.getFullYear(),
        0,
        1
    );
}


/* =========================================
   10. ПІДРАХУНОК СТАТИСТИКИ
========================================= */
/* =========================================
   РОЗРАХУНОК ВЛАСНОГО ПРОГНОЗУ (За довільний період)
========================================= */
function updateCustomForecast() {
    if (!customPeriodInput || !customPeriodUnit || !customForecastValue) return;

    let periodValue = Number(customPeriodInput.value) || 0;
    const unit = customPeriodUnit.value;

    // Обмеження: максимум 1 рік (12 місяців або 365 днів)
    if (unit === "months") {
        customPeriodInput.max = "12";
        if (periodValue > 12) {
            periodValue = 12;
            customPeriodInput.value = "12";
        }
    } else {
        customPeriodInput.max = "365";
        if (periodValue > 365) {
            periodValue = 365;
            customPeriodInput.value = "365";
        }
    }

    // Якщо немає даних або значення 0
    if (periodValue <= 0 || !teaHistory || teaHistory.length === 0) {
        customForecastValue.textContent = "0 мл";
        return;
    }

    // Середньодобова норма (за весь час ведення історії)
    const uniqueDays = new Set(teaHistory.map(item => item.date)).size || 1;
    const totalVolume = teaHistory.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
    const dailyAverage = totalVolume / uniqueDays;

    // Переведення в дні (місяць вважаємо як 30 днів)
    const totalDays = unit === "months" ? periodValue * 30 : periodValue;

    // Розрахунок прогнозованого об'єму
    const forecastVolume = dailyAverage * totalDays;
    customForecastValue.textContent = formatVolume(forecastVolume);
}

// Події зміни значення та вибору одиниці
if (customPeriodInput && customPeriodUnit) {
    customPeriodInput.addEventListener("input", updateCustomForecast);
    customPeriodUnit.addEventListener("change", updateCustomForecast);
}

function calculatePeriod(startDate) {

    let total = 0;


    teaHistory.forEach(item => {

        const itemDate =
            new Date(
                item.date + "T00:00:00"
            );


        if (itemDate >= startDate) {

            total +=
                Number(item.volume) || 0;

        }

    });


    return total;
}


/* Змінні прогнозу */
const forecastMonthStat = document.getElementById("forecastMonthStat");
const forecast6MonthsStat = document.getElementById("forecast6MonthsStat");
const forecastYearStat = document.getElementById("forecastYearStat");

/* =========================================
   РОЗРАХУНОК ПРОГНОЗУ (Скільки буде випито)
========================================= */
function calculateForecast() {
    if (!teaHistory || teaHistory.length === 0) {
        return { month: 0, sixMonths: 0, year: 0 };
    }

    // Кількість днів, у які вносилися записи
    const uniqueDays = new Set(teaHistory.map(item => item.date)).size || 1;

    // Загальний об'єм за весь час
    const totalVolume = teaHistory.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);

    // Середнє значення випитого чаю за 1 день
    const dailyAverage = totalVolume / uniqueDays;

    return {
        month: dailyAverage * 30,       // 30 днів
        sixMonths: dailyAverage * 180,  // 6 місяців (~180 днів)
        year: dailyAverage * 365        // 1 рік (365 днів)
    };
}

/* =========================================
   ОНОВЛЕННЯ СТАТИСТИКИ
========================================= */
function updateStatistics() {
    // 1. Фактично випито
    const month = calculatePeriod(getStartOfMonth());
    const sixMonths = calculatePeriod(getStartOfSixMonths());
    const year = calculatePeriod(getStartOfYear());

    monthStat.textContent = formatVolume(month);
    sixMonthsStat.textContent = formatVolume(sixMonths);
    yearStat.textContent = formatVolume(year);

    // 2. Прогноз (Орієнтовно буде випито)
    const forecast = calculateForecast();

    if (forecastMonthStat) forecastMonthStat.textContent = formatVolume(forecast.month);
    if (forecast6MonthsStat) forecast6MonthsStat.textContent = formatVolume(forecast.sixMonths);
    if (forecastYearStat) forecastYearStat.textContent = formatVolume(forecast.year);

    updateCustomForecast();
}

/* =========================================
   11. ОНОВЛЕННЯ СТАТИСТИКИ
========================================= */

/* =========================================
   12. СТВОРЕННЯ СНІГУ
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
   13. ВИДАЛЕННЯ СНІГУ
========================================= */

function removeSnow() {

    snowContainer.innerHTML = "";

}


/* =========================================
   14. СТВОРЕННЯ ДОЩУ
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
   15. ВИДАЛЕННЯ ДОЩУ
========================================= */

function removeRain() {

    rainContainer.innerHTML = "";

}


/* =========================================
   16. ОТРИМАННЯ ПОГОДИ
========================================= */

async function getWeather() {

    try {

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


        weatherStatus.textContent =
            "Помилка";


        weatherTemperature.textContent =
            "--";


        weatherCity.textContent =
            "Невідомо";


        weatherText.textContent =
            "Погода недоступна";

    }

}


/* =========================================
   17. ВИЗНАЧЕННЯ ПОГОДИ
========================================= */

function updateWeather(
    code,
    temperature,
    city
) {

    removeSnow();

    removeRain();


    /* ЯСНО */

    if (code === 0) {

        weatherIcon.textContent =
            "☀️";

        weatherStatus.textContent =
            "Ясно";

        weatherText.textContent =
            "Чисте небо";
    }


    /* ХМАРНО */

    else if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        weatherIcon.textContent =
            "🌤️";

        weatherStatus.textContent =
            "Хмарно";

        weatherText.textContent =
            "Мінлива хмарність";
    }


    /* ТУМАН */

    else if (
        code === 45 ||
        code === 48
    ) {

        weatherIcon.textContent =
            "🌫️";

        weatherStatus.textContent =
            "Туман";

        weatherText.textContent =
            "Видимість знижена";
    }


    /* ДОЩ */

    else if (
        code >= 51 &&
        code <= 67
    ) {

        weatherIcon.textContent =
            "🌧️";

        weatherStatus.textContent =
            "Дощ";

        weatherText.textContent =
            "Опади";

        createRain();
    }


    /* СНІГ */

    else if (
        code >= 71 &&
        code <= 86
    ) {

        weatherIcon.textContent =
            "❄️";

        weatherStatus.textContent =
            "Сніг";

        weatherText.textContent =
            "Снігопад";

        createSnow();
    }


    /* ГРОЗА */

    else if (code >= 95) {

        weatherIcon.textContent =
            "⛈️";

        weatherStatus.textContent =
            "Гроза";

        weatherText.textContent =
            "Гроза";
    }


    /* ІНШЕ */

    else {

        weatherIcon.textContent =
            "🌤️";

        weatherStatus.textContent =
            "Погода";

        weatherText.textContent =
            "Невідомо";
    }


    /* Температура */

    weatherTemperature.textContent =
        Math.round(temperature);


    /* Місто */

    weatherCity.textContent =
        city;
}


/* =========================================
   18. ЗАПУСК
========================================= */

/* Статистика при відкритті */

updateStatistics();


/* Погода */

getWeather();
/* =========================================
   ТЕСТ ДОЩУ
========================================= */

const rainTestButton =
    document.getElementById("rainTestButton");

let rainTestActive = false;

if (rainTestButton) {

    rainTestButton.addEventListener("click", () => {

        rainTestActive = !rainTestActive;

        if (rainTestActive) {

            createRain();

            rainTestButton.textContent =
                "☀️ Вимкнути дощ";

        } else {

            removeRain();

            rainTestButton.textContent =
                "🌧️ Тест дощу";

        }});

    

}


/* =========================================
   ГРАФІК ЗА ОСТАННІ 7 ДНІВ
========================================= */

function updateTeaChart() {

    const chartArea =
        document.getElementById("chartArea");

    const chartTotal =
        document.getElementById("chartTotal");

    if (!chartArea) return;


    chartArea.innerHTML = "";


    /* Отримуємо історію */

    const history =
        JSON.parse(
            localStorage.getItem("teaHistory")
        ) || [];


    /* Останні 7 днів */

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        days.push({

            key: getDateKey(date),

            date: date,

            volume: 0

        });

    }


    /* Знаходимо чай за кожен день */

    history.forEach(item => {

        const day =
            days.find(
                d => d.key === item.date
            );

        if (day) {

            day.volume +=
                Number(item.volume) || 0;

        }

    });


    /* Максимальне значення */

    const maxVolume =
        Math.max(
            ...days.map(
                d => d.volume
            ),
            500
        );


    /* Загальна кількість */

    const total =
        days.reduce(
            (sum, day) =>
                sum + day.volume,
            0
        );


    chartTotal.textContent =
        formatVolume(total);


    /* Створюємо стовпчики */

    days.forEach(day => {

        const column =
            document.createElement("div");

        column.className =
            "chart-column";


        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";


        /* Висота */

        const height =
            (day.volume / maxVolume) * 100;

        bar.style.height =
            `${Math.max(height, 2)}%`;


        /* Значення */

        const value =
            document.createElement("span");

        value.className =
            "chart-value";

        value.textContent =
            formatVolume(day.volume);


        /* День */

        const dayName =
            document.createElement("span");

        dayName.className =
            "chart-day";

        dayName.textContent =
            day.date.toLocaleDateString(
                "uk-UA",
                {
                    weekday: "short"
                }
            );


        bar.appendChild(value);

        column.appendChild(bar);

        column.appendChild(dayName);

        chartArea.appendChild(column);

    });

}


/* =========================================
   ЗАПУСК ГРАФІКА
========================================= */

updateTeaChart();
/* =========================================
   ОБМЕЖЕННЯ ВВОДУ В ПОЛІ (MAX 1L / 1000ML)
========================================= */
function updateCupVolumeLimits() {
    if (volumeUnit.value === "l") {
        cupVolume.max = "1";
        if (Number(cupVolume.value) > 1) {
            cupVolume.value = "1";
        }
    } else {
        cupVolume.max = "1000";
        if (Number(cupVolume.value) > 1000) {
            cupVolume.value = "1000";
        }
    }
}

// При зміні одиниці виміру (мл/л) оновлюємо максимум
volumeUnit.addEventListener("change", updateCupVolumeLimits);

// При введенні значення не даємо ввести більше максимуму
cupVolume.addEventListener("input", () => {
    const maxLimit = volumeUnit.value === "l" ? 1 : 1000;
    if (Number(cupVolume.value) > maxLimit) {
        cupVolume.value = maxLimit;
    }
});

/* =========================================
   ОЧИЩЕННЯ ІСТОРІЇ ТА LOCAL STORAGE
========================================= */

const clearHistoryButton = 
    document.getElementById("clearHistoryButton");

if (clearHistoryButton) {

    clearHistoryButton.addEventListener("click", () => {

        const isConfirmed = confirm(
            "Ви дійсно бажаєте очистити всю історію з LocalStorage та скинути лічильники?"
        );

        if (isConfirmed) {

            // 1. Повністю видаляємо ключі з LocalStorage
            localStorage.removeItem("teaCount");
            localStorage.removeItem("teaCountDate");
            localStorage.removeItem("teaHistory");

            // 2. Скидаємо змінні в пам'яті програмного коду
            tea = 0;
            teaHistory = [];

            // 3. Оновлюємо лічильник за сьогодні на екрані
            if (teaCount) {
                teaCount.textContent = formatVolume(0);
            }

            // 4. Перераховуємо статистику та оновлюємо графік
            updateStatistics();

            if (typeof updateTeaChart === "function") {
                updateTeaChart();
            }

            alert("LocalStorage та історію успішно очищено!");
        }

    });
    /* =========================================
   РОЗРАХУНОК ВЛАСНОГО ПРОГНОЗУ (За довільний період)
========================================= */
function updateCustomForecast() {
    if (!customPeriodInput || !customPeriodUnit || !customForecastValue) return;

    let periodValue = Number(customPeriodInput.value) || 0;
    const unit = customPeriodUnit.value;

    // Обмеження: максимум 1 рік (12 місяців або 365 днів)
    if (unit === "months") {
        customPeriodInput.max = "12";
        if (periodValue > 12) {
            periodValue = 12;
            customPeriodInput.value = "12";
        }
    } else {
        customPeriodInput.max = "365";
        if (periodValue > 365) {
            periodValue = 365;
            customPeriodInput.value = "365";
        }
    }

    // Якщо немає даних або значення 0
    if (periodValue <= 0 || !teaHistory || teaHistory.length === 0) {
        customForecastValue.textContent = "0 мл";
        return;
    }

    // Середньодобова норма (за весь час ведення історії)
    const uniqueDays = new Set(teaHistory.map(item => item.date)).size || 1;
    const totalVolume = teaHistory.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
    const dailyAverage = totalVolume / uniqueDays;

    // Переведення в дні (місяць вважаємо як 30 днів)
    const totalDays = unit === "months" ? periodValue * 30 : periodValue;

    // Розрахунок прогнозованого об'єму
    const forecastVolume = dailyAverage * totalDays;
    customForecastValue.textContent = formatVolume(forecastVolume);
}

// Події зміни значення та вибору одиниці
if (customPeriodInput && customPeriodUnit) {
    customPeriodInput.addEventListener("input", updateCustomForecast);
    customPeriodUnit.addEventListener("change", updateCustomForecast);
}

function calculatePeriod(startDate) {

    let total = 0;


    teaHistory.forEach(item => {

        const itemDate =
            new Date(
                item.date + "T00:00:00"
            );


        if (itemDate >= startDate) {

            total +=
                Number(item.volume) || 0;

        }

    });


    return total;
}


/* Змінні прогнозу */
const forecastMonthStat = document.getElementById("forecastMonthStat");
const forecast6MonthsStat = document.getElementById("forecast6MonthsStat");
const forecastYearStat = document.getElementById("forecastYearStat");

/* =========================================
   РОЗРАХУНОК ПРОГНОЗУ (Скільки буде випито)
========================================= */
function calculateForecast() {
    if (!teaHistory || teaHistory.length === 0) {
        return { month: 0, sixMonths: 0, year: 0 };
    }

    // Кількість днів, у які вносилися записи
    const uniqueDays = new Set(teaHistory.map(item => item.date)).size || 1;

    // Загальний об'єм за весь час
    const totalVolume = teaHistory.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);

    // Середнє значення випитого чаю за 1 день
    const dailyAverage = totalVolume / uniqueDays;

    return {
        month: dailyAverage * 30,       // 30 днів
        sixMonths: dailyAverage * 180,  // 6 місяців (~180 днів)
        year: dailyAverage * 365        // 1 рік (365 днів)
    };
}

/* =========================================
   ОНОВЛЕННЯ СТАТИСТИКИ
========================================= */
function updateStatistics() {
    // 1. Фактично випито
    const month = calculatePeriod(getStartOfMonth());
    const sixMonths = calculatePeriod(getStartOfSixMonths());
    const year = calculatePeriod(getStartOfYear());

    monthStat.textContent = formatVolume(month);
    sixMonthsStat.textContent = formatVolume(sixMonths);
    yearStat.textContent = formatVolume(year);

    // 2. Прогноз (Орієнтовно буде випито)
    const forecast = calculateForecast();

    if (forecastMonthStat) forecastMonthStat.textContent = formatVolume(forecast.month);
    if (forecast6MonthsStat) forecast6MonthsStat.textContent = formatVolume(forecast.sixMonths);
    if (forecastYearStat) forecastYearStat.textContent = formatVolume(forecast.year);

    updateCustomForecast();
}


  const weatherData = {

    rain: {
        icon: "🌧️",
        name: "Дощ",
        temperature: "+12°C"
    },

    snow: {
        icon: "❄️",
        name: "Сніг",
        temperature: "-5°C"
    },

    storm: {
        icon: "⛈️",
        name: "Гроза",
        temperature: "+10°C"
    },

    fog: {
        icon: "🌫️",
        name: "Туман",
        temperature: "+7°C"
    }

};


/* =================================
   ПОТОЧНА ПОГОДА
================================= */

let currentWeather = "rain";


/* =================================
   ЗМІНА ПОГОДИ
================================= */

function changeWeather(type) {

    if (!weatherData[type]) {
        return;
    }

    currentWeather = type;

    const weather = weatherData[type];


    // Значок
    document.getElementById("weatherIcon").textContent =
        weather.icon;


    // Назва
    document.getElementById("weatherType").textContent =
        weather.name;


    // Температура
    document.getElementById("temperature").textContent =
        weather.temperature;


    // Повністю очищаємо старий ефект
    clearWeatherEffects();


    // Запускаємо НОВУ погоду
    startWeather(type);
}


/* =================================
   ЗАПУСК ПОГОДИ
================================= */

function startWeather(type) {

    if (type === "rain") {
        startRain();
    }

    if (type === "snow") {
        startSnow();
    }

    if (type === "storm") {
        startStorm();
    }

    if (type === "fog") {
        startFog();
    }
}


/* =================================
   ДОЩ — ПОСТІЙНИЙ
================================= */

let rainTimer = null;

function startRain() {

    // Краплі створюються постійно
    rainTimer = setInterval(() => {

        createRainDrop();

        createRainDrop();

        createRainDrop();

    }, 70);
}


function createRainDrop() {

    // Перевіряємо, що зараз саме дощ
    if (currentWeather !== "rain" &&
        currentWeather !== "storm") {

        return;
    }


    const drop =
        document.createElement("div");

    drop.className =
        "rain-drop";


    drop.style.left =
        Math.random() * 100 + "vw";


    drop.style.animationDuration =
        (0.45 + Math.random() * 0.6) + "s";


    document
        .getElementById("weatherEffect")
        .appendChild(drop);


    setTimeout(() => {

        drop.remove();

    }, 1500);
}


/* =================================
   СНІГ — ПОСТІЙНИЙ
================================= */

let snowTimer = null;

function startSnow() {

    snowTimer = setInterval(() => {

        createSnowflake();

        createSnowflake();

    }, 180);
}


function createSnowflake() {

    if (currentWeather !== "snow") {
        return;
    }


    const snow =
        document.createElement("div");

    snow.className =
        "snowflake";

    snow.textContent =
        "❄";


    snow.style.left =
        Math.random() * 100 + "vw";


    snow.style.fontSize =
        (12 + Math.random() * 25) + "px";


    snow.style.animationDuration =
        (4 + Math.random() * 5) + "s";


    document
        .getElementById("weatherEffect")
        .appendChild(snow);


    setTimeout(() => {

        snow.remove();

    }, 10000);
}


/* =================================
   ГРОЗА — ПОСТІЙНА
================================= */

let stormRainTimer = null;
let stormLightningTimer = null;


function startStorm() {

    // Постійний дощ
    stormRainTimer = setInterval(() => {

        createRainDrop();
        createRainDrop();
        createRainDrop();

    }, 80);


    // Блискавки
    stormLightningTimer = setInterval(() => {

        createLightning();

    }, 3000);
}


function createLightning() {

    if (currentWeather !== "storm") {
        return;
    }


    const lightning =
        document.createElement("div");

    lightning.className =
        "lightning";


    document
        .getElementById("weatherEffect")
        .appendChild(lightning);


    setTimeout(() => {

        lightning.remove();

    }, 500);


    // Другий короткий спалах
    setTimeout(() => {

        if (currentWeather !== "storm") {
            return;
        }

        const second =
            document.createElement("div");

        second.className =
            "lightning";


        document
            .getElementById("weatherEffect")
            .appendChild(second);


        setTimeout(() => {

            second.remove();

        }, 400);

    }, 700);
}


/* =================================
   ТУМАН — ПОСТІЙНИЙ
================================= */

function startFog() {

    const fog =
        document.createElement("div");

    fog.className =
        "fog";


    document
        .getElementById("weatherEffect")
        .appendChild(fog);
}


/* =================================
   ТЕСТ ДОЩУ
================================= */

function testRain() {

    changeWeather("rain");

}
}
/* =========================================================
   СИСТЕМА КВЕСТОВ
   ========================================================= */

/* =========================================================
   НАСТРОЙКИ
   ========================================================= */

const QUEST_STORAGE_KEY = "teaQuestProgress";


/* =========================================================
   КВЕСТЫ
   ========================================================= */

const quests = [

    /* =====================================================
       УРОВЕНЬ 1
       ===================================================== */

    {
        id: 1,
        level: 1,

        title: "Перша чашка",
        description: "Випий свою першу чашку чаю.",

        goal: 1,
        reward: 10,

        icon: "🍵"
    },

    {
        id: 2,
        level: 1,

        title: "Маленький початок",
        description: "Випий 500 мл чаю.",

        goal: 500,
        reward: 20,

        icon: "🌱"
    },

    {
        id: 3,
        level: 1,

        title: "Чайний день",
        description: "Випий 1 літр чаю за день.",

        goal: 1000,
        reward: 30,

        icon: "☕"
    },


    /* =====================================================
       УРОВЕНЬ 2
       ===================================================== */

    {
        id: 4,
        level: 2,

        title: "Чайний ентузіаст",
        description: "Випий 2 літри чаю за один день.",

        goal: 2000,
        reward: 50,

        icon: "🔥"
    },

    {
        id: 5,
        level: 2,

        title: "П'ять чашок",
        description: "Випий чай 5 разів.",

        goal: 5,
        reward: 60,

        icon: "🍵"
    },

    {
        id: 6,
        level: 2,

        title: "Чайний тиждень",
        description: "Веди історію чаю протягом 7 різних днів.",

        goal: 7,
        reward: 100,

        icon: "📅"
    },


    /* =====================================================
       УРОВЕНЬ 3
       ===================================================== */

    {
        id: 7,
        level: 3,

        title: "Майстер чаю",
        description: "Випий загалом 5 літрів чаю.",

        goal: 5000,
        reward: 150,

        icon: "👑"
    },

    {
        id: 8,
        level: 3,

        title: "Чайний марафон",
        description: "Веди історію чаю протягом 14 різних днів.",

        goal: 14,
        reward: 200,

        icon: "🏆"
    },

    {
        id: 9,
        level: 3,

        title: "Великий запас",
        description: "Випий загалом 10 літрів чаю.",

        goal: 10000,
        reward: 300,

        icon: "💎"
    }

];


/* =========================================================
   ЗБЕРЕЖЕННЯ ПРОГРЕСУ
   ========================================================= */

let questProgress =
    JSON.parse(
        localStorage.getItem(QUEST_STORAGE_KEY)
    ) || {};


/* =========================================================
   ІНІЦІАЛІЗАЦІЯ ПРОГРЕСУ
   ========================================================= */

function initializeQuestProgress() {

    quests.forEach(quest => {

        if (!questProgress[quest.id]) {

            questProgress[quest.id] = {

                progress: 0,

                completed: false,

                rewardGiven: false

            };

        }

    });

    saveQuestProgress();

}


/* =========================================================
   ЗБЕРЕЖЕННЯ
   ========================================================= */

function saveQuestProgress() {

    localStorage.setItem(
        QUEST_STORAGE_KEY,
        JSON.stringify(questProgress)
    );

}


/* =========================================================
   ОТРИМАННЯ ІСТОРІЇ
   ========================================================= */

function getQuestHistory() {

    return JSON.parse(
        localStorage.getItem("teaHistory")
    ) || [];

}


/* =========================================================
   ЗАГАЛЬНИЙ ОБ'ЄМ ЧАЮ
   ========================================================= */

function getTotalTeaVolume() {

    const history =
        getQuestHistory();

    return history.reduce(
        (total, item) => {

            return total +
                (Number(item.volume) || 0);

        },
        0
    );

}


/* =========================================================
   КІЛЬКІСТЬ ЧАШОК
   ========================================================= */

function getTotalTeaCups() {

    const history =
        getQuestHistory();

    return history.length;

}


/* =========================================================
   КІЛЬКІСТЬ УНІКАЛЬНИХ ДНІВ
   ========================================================= */

function getUniqueTeaDays() {

    const history =
        getQuestHistory();

    const days =
        new Set(
            history.map(
                item => item.date
            )
        );

    return days.size;

}


/* =========================================================
   ОБ'ЄМ ЧАЮ ЗА СЬОГОДНІ
   ========================================================= */

function getTodayTeaVolume() {

    const history =
        getQuestHistory();

    const today =
        getDateKey();

    return history.reduce(
        (total, item) => {

            if (item.date === today) {

                return total +
                    (Number(item.volume) || 0);

            }

            return total;

        },
        0
    );

}


/* =========================================================
   ПРОГРЕС КОНКРЕТНОГО КВЕСТУ
   ========================================================= */

function calculateQuestProgress(quest) {

    /* -----------------------------------------
       ПЕРШИЙ КВЕСТ
       ----------------------------------------- */

    if (quest.id === 1) {

        return Math.min(
            getTotalTeaCups(),
            quest.goal
        );

    }


    /* -----------------------------------------
       500 МЛ
       ----------------------------------------- */

    if (quest.id === 2) {

        return Math.min(
            getTotalTeaVolume(),
            quest.goal
        );

    }


    /* -----------------------------------------
       1 ЛІТР ЗА ДЕНЬ
       ----------------------------------------- */

    if (quest.id === 3) {

        return Math.min(
            getTodayTeaVolume(),
            quest.goal
        );

    }


    /* -----------------------------------------
       2 ЛІТРИ ЗА ДЕНЬ
       ----------------------------------------- */

    if (quest.id === 4) {

        return Math.min(
            getTodayTeaVolume(),
            quest.goal
        );

    }


    /* -----------------------------------------
       5 ЧАШОК
       ----------------------------------------- */

    if (quest.id === 5) {

        return Math.min(
            getTotalTeaCups(),
            quest.goal
        );

    }


    /* -----------------------------------------
       7 ДНІВ
       ----------------------------------------- */

    if (quest.id === 6) {

        return Math.min(
            getUniqueTeaDays(),
            quest.goal
        );

    }


    /* -----------------------------------------
       5 ЛІТРІВ
       ----------------------------------------- */

    if (quest.id === 7) {

        return Math.min(
            getTotalTeaVolume(),
            quest.goal
        );

    }


    /* -----------------------------------------
       14 ДНІВ
       ----------------------------------------- */

    if (quest.id === 8) {

        return Math.min(
            getUniqueTeaDays(),
            quest.goal
        );

    }


    /* -----------------------------------------
       10 ЛІТРІВ
       ----------------------------------------- */

    if (quest.id === 9) {

        return Math.min(
            getTotalTeaVolume(),
            quest.goal
        );

    }


    return 0;

}


/* =========================================================
   ПЕРЕВІРКА РІВНЯ
   ========================================================= */

function isLevelUnlocked(level) {

    /* Перший рівень завжди відкритий */

    if (level === 1) {

        return true;

    }


    /* Знаходимо квести попереднього рівня */

    const previousLevel =
        quests.filter(
            quest =>
                quest.level === level - 1
        );


    /* Якщо попереднього рівня немає */

    if (previousLevel.length === 0) {

        return true;

    }


    /* Всі квести попереднього рівня
       повинні бути виконані */

    return previousLevel.every(
        quest =>
            questProgress[quest.id] &&
            questProgress[quest.id].completed
    );

}


/* =========================================================
   ОНОВЛЕННЯ ПРОГРЕСУ
   ========================================================= */

function updateQuestProgress() {

    quests.forEach(quest => {

        const progress =
            calculateQuestProgress(quest);

        const saved =
            questProgress[quest.id];


        if (!saved) {

            questProgress[quest.id] = {

                progress: progress,

                completed: false,

                rewardGiven: false

            };

            return;

        }


        /* Не дозволяємо перевищувати ціль */

        saved.progress =
            Math.min(
                progress,
                quest.goal
            );


        /* Перевіряємо виконання */

        if (
            saved.progress >= quest.goal &&
            !saved.completed
        ) {

            saved.completed = true;

        }

    });


    saveQuestProgress();

}


/* =========================================================
   ФОРМАТУВАННЯ ПРОГРЕСУ
   ========================================================= */

function formatQuestProgress(
    quest,
    progress
) {

    /* Для об'єму */

    if (
        quest.id === 2 ||
        quest.id === 3 ||
        quest.id === 4 ||
        quest.id === 7 ||
        quest.id === 9
    ) {

        return (
            formatVolume(progress) +
            " / " +
            formatVolume(quest.goal)
        );

    }


    return (
        progress +
        " / " +
        quest.goal
    );

}


/* =========================================================
   СТВОРЕННЯ КВЕСТУ
   ========================================================= */

function createQuestElement(quest) {

    const saved =
        questProgress[quest.id];


    const progress =
        saved.progress;


    const completed =
        saved.completed;


    const percent =
        Math.min(
            (progress / quest.goal) * 100,
            100
        );


    const locked =
        !isLevelUnlocked(quest.level);


    const questElement =
        document.createElement("div");

    questElement.className =
        "quest";


    if (completed) {

        questElement.classList.add(
            "completed"
        );

    }


    if (locked) {

        questElement.classList.add(
            "locked"
        );

    }


    /* -----------------------------------------
       ВМІСТ
       ----------------------------------------- */

    questElement.innerHTML = `

        <div class="quest-icon">
            ${locked ? "🔒" : quest.icon}
        </div>

        <div class="quest-content">

            <h3>
                ${quest.title}
            </h3>

            <p>
                ${
                    locked
                    ? "Виконайте всі квести попереднього рівня."
                    : quest.description
                }
            </p>

            ${
                !locked
                ? `
                <div class="quest-progress">

                    <div class="quest-progress-bar">

                        <div
                            class="quest-progress-fill"
                            style="width: ${percent}%"
                        ></div>

                    </div>

                    <span class="quest-progress-text">
                        ${formatQuestProgress(quest, progress)}
                    </span>

                </div>
                `
                : ""
            }

        </div>

        <div class="quest-reward">

            🪙 ${quest.reward}

        </div>

        ${
            completed
            ? `
                <div class="quest-completed">
                    ✅
                </div>
            `
            : ""
        }

    `;


    return questElement;

}


/* =========================================================
   ВІДОБРАЖЕННЯ КВЕСТІВ
   ========================================================= */

function renderQuests() {

    const questsContainer =
        document.getElementById(
            "questsContainer"
        );


    if (!questsContainer) {

        console.warn(
            "Не знайдено #questsContainer"
        );

        return;

    }


    questsContainer.innerHTML = "";


    /* Отримуємо всі рівні */

    const levels =
        [...new Set(
            quests.map(
                quest => quest.level
            )
        )];


    levels.forEach(level => {

        /* Заголовок рівня */

        const levelTitle =
            document.createElement("div");

        levelTitle.className =
            "quest-level-title";


        const unlocked =
            isLevelUnlocked(level);


        levelTitle.innerHTML = `

            <h2>

                ${
                    level === 1
                    ? "🟢 Рівень 1"
                    : level === 2
                    ? "🔵 Рівень 2"
                    : level === 3
                    ? "🟣 Рівень 3"
                    : "⭐ Рівень " + level
                }

            </h2>

            <span>

                ${
                    unlocked
                    ? "Відкрито"
                    : "🔒 Заблоковано"
                }

            </span>

        `;


        questsContainer.appendChild(
            levelTitle
        );


        /* Квести цього рівня */

        const levelQuests =
            quests.filter(
                quest =>
                    quest.level === level
            );


        levelQuests.forEach(
            quest => {

                questsContainer.appendChild(
                    createQuestElement(quest)
                );

            }
        );

    });

}


/* =========================================================
   ЗАГАЛЬНИЙ ПРОГРЕС
   ========================================================= */

function updateQuestStats() {

    const total =
        quests.length;


    const completed =
        quests.filter(
            quest =>
                questProgress[quest.id] &&
                questProgress[quest.id].completed
        ).length;


    const progressElement =
        document.getElementById(
            "questsCompleted"
        );


    const totalElement =
        document.getElementById(
            "questsTotal"
        );


    const progressBar =
        document.getElementById(
            "questsProgress"
        );


    if (progressElement) {

        progressElement.textContent =
            completed;

    }


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (progressBar) {

        const percent =
            total > 0
            ? (completed / total) * 100
            : 0;

        progressBar.style.width =
            percent + "%";

    }

}


/* =========================================================
   ОНОВЛЕННЯ ВСІЄЇ СИСТЕМИ
   ========================================================= */

function updateQuests() {

    updateQuestProgress();

    renderQuests();

    updateQuestStats();

}


/* =========================================================
   СКИДАННЯ КВЕСТІВ
   ========================================================= */

function resetQuests() {

    const confirmed =
        confirm(
            "Ви дійсно хочете скинути весь прогрес квестів?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        QUEST_STORAGE_KEY
    );


    questProgress = {};


    initializeQuestProgress();

    updateQuests();


    alert(
        "Прогрес квестів успішно скинуто!"
    );

}


/* =========================================================
   КНОПКА СКИДАННЯ
   ========================================================= */

const resetQuestsButton =
    document.getElementById(
        "resetQuestsButton"
    );


if (resetQuestsButton) {

    resetQuestsButton.addEventListener(
        "click",
        resetQuests
    );

}


/* =========================================================
   СЛУХАЧ ДОДАВАННЯ ЧАЮ
   ========================================================= */

/*
   Коли користувач додає чай,
   квести автоматично перевіряються.
*/

if (teaButton) {

    teaButton.addEventListener(
        "click",
        () => {

            /*
               Невелика затримка,
               щоб teaHistory вже встиг
               зберегтися.
            */

            setTimeout(() => {

                updateQuests();

            }, 50);

        }
    );

}


/* =========================================================
   ЗАПУСК
   ========================================================= */

initializeQuestProgress();

updateQuests();



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


    /* Літри → мілілітри */

    if (unit === "l") {

        volume =
            volume * 1000;
    }


    /* Загальна кількість */

    tea += volume;


    teaCount.textContent =
        formatVolume(tea);


    localStorage.setItem(
        "teaCount",
        tea
    );


    /* Додаємо запис у історію */

    teaHistory.push({

        date:
            getDateKey(),

        volume:
            volume

    });


    localStorage.setItem(
        "teaHistory",
        JSON.stringify(teaHistory)
    );


    /* Оновлюємо статистику */

    updateStatistics();

});


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


/* =========================================
   11. ОНОВЛЕННЯ СТАТИСТИКИ
========================================= */

function updateStatistics() {

    const month =
        calculatePeriod(
            getStartOfMonth()
        );


    const sixMonths =
        calculatePeriod(
            getStartOfSixMonths()
        );


    const year =
        calculatePeriod(
            getStartOfYear()
        );


    monthStat.textContent =
        formatVolume(month);


    sixMonthsStat.textContent =
        formatVolume(sixMonths);


    yearStat.textContent =
        formatVolume(year);
}


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
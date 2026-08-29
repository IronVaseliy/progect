"use strict";

const $ = (id) => document.getElementById(id);

const themeButton = $("themeButton");
const teaButton = $("teaButton");
const teaCount = $("teaCount");
const cupVolume = $("cupVolume");
const volumeUnit = $("volumeUnit");

const monthStat = $("monthStat");
const sixMonthsStat = $("sixMonthsStat");
const yearStat = $("yearStat");
const forecastMonthStat = $("forecastMonthStat");
const forecast6MonthsStat = $("forecast6MonthsStat");
const forecastYearStat = $("forecastYearStat");

const customPeriodInput = $("customPeriodInput");
const customPeriodUnit = $("customPeriodUnit");
const customForecastValue = $("customForecastValue");

const chartArea = $("chartArea");
const chartTotal = $("chartTotal");

const weatherIcon = $("weatherIcon");
const weatherType = $("weatherStatus");
const weatherTemperature = $("weatherTemperature");
const weatherCity = $("weatherCity");
const weatherText = $("weatherText");
const weatherEffect = $("weatherEffect");
const weatherRefresh = $("weatherRefresh");

const QUEST_STORAGE_KEY = "teaQuestProgress";
const XP_STORAGE_KEY = "teaXP";
const LEVEL_STORAGE_KEY = "teaLevel";


// ===============================
// ДОПОМІЖНІ ФУНКЦІЇ
// ===============================

function formatVolume(ml) {
    ml = Number(ml) || 0;

    if (ml >= 1000) {
        return `${(ml / 1000).toFixed(2).replace(/\.00$/, "")} л`;
    }

    return `${Math.round(ml)} мл`;
}

function getDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


// ===============================
// ІСТОРІЯ ЧАЮ
// ===============================

function readHistory() {
    try {
        const data = JSON.parse(
            localStorage.getItem("teaHistory") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch {
        return [];
    }
}

let teaHistory = readHistory();

function saveHistory() {
    localStorage.setItem(
        "teaHistory",
        JSON.stringify(teaHistory)
    );
}


// ===============================
// ТЕМА
// ===============================

function loadTheme() {
    const dark =
        localStorage.getItem("teaDarkMode") === "1";

    document.body.classList.toggle("dark", dark);

    themeButton.textContent =
        dark ? "🌙" : "☀️";
}

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "teaDarkMode",
        dark ? "1" : "0"
    );

    themeButton.textContent =
        dark ? "🌙" : "☀️";
});

loadTheme();


// ===============================
// ОБ'ЄМ ЧАШКИ
// ===============================

function updateCupLimit() {

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

volumeUnit.addEventListener(
    "change",
    updateCupLimit
);

cupVolume.addEventListener(
    "input",
    updateCupLimit
);


// ===============================
// СЬОГОДНІ
// ===============================

function getTodayTea() {

    const today = getDateKey();

    return teaHistory.reduce(
        (sum, item) => {

            if (item.date === today) {
                return sum + (Number(item.volume) || 0);
            }

            return sum;

        },
        0
    );
}

function updateTodayCounter() {

    teaCount.textContent =
        formatVolume(getTodayTea());
}


// ===============================
// ДОДАТИ ЧАЙ
// ===============================

teaButton.addEventListener("click", () => {

    let volume = Number(cupVolume.value);

    if (!Number.isFinite(volume) || volume <= 0) {

        alert("Вкажіть правильний об'єм чашки!");

        cupVolume.focus();

        return;
    }

    if (volumeUnit.value === "l") {
        volume *= 1000;
    }

    teaHistory.push({

        date: getDateKey(),

        volume: Math.round(volume)

    });

    saveHistory();

    updateTodayCounter();
    updateStatistics();
    updateTeaChart();
    updateQuests();

    teaButton.classList.remove(
        "tea-added"
    );

    void teaButton.offsetWidth;

    teaButton.classList.add(
        "tea-added"
    );
});


// ===============================
// СТАТИСТИКА
// ===============================

function startOfMonth() {

    const n = new Date();

    return new Date(
        n.getFullYear(),
        n.getMonth(),
        1
    );
}

function startOfSixMonths() {

    const n = new Date();

    return new Date(
        n.getFullYear(),
        n.getMonth() - 5,
        1
    );
}

function startOfYear() {

    const n = new Date();

    return new Date(
        n.getFullYear(),
        0,
        1
    );
}

function calculatePeriod(startDate) {

    return teaHistory.reduce(
        (sum, item) => {

            const d =
                new Date(item.date + "T00:00:00");

            if (d >= startDate) {
                return sum +
                    (Number(item.volume) || 0);
            }

            return sum;

        },
        0
    );
}


function calculateForecast() {

    if (!teaHistory.length) {

        return {
            month: 0,
            sixMonths: 0,
            year: 0
        };
    }

    const uniqueDays =
        new Set(
            teaHistory.map(item => item.date)
        ).size || 1;

    const total =
        teaHistory.reduce(
            (sum, item) =>
                sum + (Number(item.volume) || 0),
            0
        );

    const dailyAverage =
        total / uniqueDays;

    return {

        month: dailyAverage * 30,

        sixMonths: dailyAverage * 180,

        year: dailyAverage * 365
    };
}


// ===============================
// ВЛАСНИЙ ПРОГНОЗ
// ===============================

function updateCustomForecast() {

    if (
        !customPeriodInput ||
        !customPeriodUnit ||
        !customForecastValue
    ) {
        return;
    }

    let period =
        Number(customPeriodInput.value) || 0;

    if (
        customPeriodUnit.value === "months"
    ) {

        customPeriodInput.max = "12";

        period = Math.min(period, 12);

    } else {

        customPeriodInput.max = "365";

        period = Math.min(period, 365);
    }

    if (
        period <= 0 ||
        !teaHistory.length
    ) {

        customForecastValue.textContent =
            "0 мл";

        return;
    }

    const uniqueDays =
        new Set(
            teaHistory.map(item => item.date)
        ).size || 1;

    const total =
        teaHistory.reduce(
            (sum, item) =>
                sum + (Number(item.volume) || 0),
            0
        );

    const dailyAverage =
        total / uniqueDays;

    const days =
        customPeriodUnit.value === "months"
            ? period * 30
            : period;

    customForecastValue.textContent =
        formatVolume(
            dailyAverage * days
        );
}

customPeriodInput.addEventListener(
    "input",
    updateCustomForecast
);

customPeriodUnit.addEventListener(
    "change",
    updateCustomForecast
);


// ===============================
// ОНОВЛЕННЯ СТАТИСТИКИ
// ===============================

function updateStatistics() {

    monthStat.textContent =
        formatVolume(
            calculatePeriod(
                startOfMonth()
            )
        );

    sixMonthsStat.textContent =
        formatVolume(
            calculatePeriod(
                startOfSixMonths()
            )
        );

    yearStat.textContent =
        formatVolume(
            calculatePeriod(
                startOfYear()
            )
        );


    const forecast =
        calculateForecast();

    forecastMonthStat.textContent =
        formatVolume(
            forecast.month
        );

    forecast6MonthsStat.textContent =
        formatVolume(
            forecast.sixMonths
        );

    forecastYearStat.textContent =
        formatVolume(
            forecast.year
        );

    updateCustomForecast();
}


// ===============================
// ГРАФІК
// ===============================

function updateTeaChart() {

    if (!chartArea) {
        return;
    }

    chartArea.innerHTML = "";

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setHours(
            0,
            0,
            0,
            0
        );

        date.setDate(
            date.getDate() - i
        );

        days.push({

            key: getDateKey(date),

            date: date,

            volume: 0

        });
    }


    teaHistory.forEach(item => {

        const day =
            days.find(
                d => d.key === item.date
            );

        if (day) {

            day.volume +=
                Number(item.volume) || 0;
        }
    });


    const maxVolume =
        Math.max(
            ...days.map(
                d => d.volume
            ),
            2000
        );

    const total =
        days.reduce(
            (sum, d) =>
                sum + d.volume,
            0
        );

    chartTotal.textContent =
        formatVolume(total);


    days.forEach(day => {

        const column =
            document.createElement("div");

        column.className =
            "chart-column";


        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";


        const height =
            day.volume > 0
                ? (day.volume / maxVolume) * 100
                : 2;


        bar.style.height =
            `${Math.min(height, 100)}%`;


        const value =
            document.createElement("span");

        value.className =
            "chart-value";

        value.textContent =
            formatVolume(day.volume);


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


// ===============================
// ОЧИЩЕННЯ ІСТОРІЇ
// ===============================

$("clearHistoryButton")
    .addEventListener("click", () => {

        if (
            !confirm(
                "Очистити всю історію чаю та статистику?"
            )
        ) {
            return;
        }

        teaHistory = [];

        saveHistory();

        localStorage.removeItem(
            "teaCount"
        );

        localStorage.removeItem(
            "teaCountDate"
        );

        updateTodayCounter();

        updateStatistics();

        updateTeaChart();

        updateQuests();

        alert(
            "Історію чаю очищено!"
        );
    });


// ===============================
// ПОГОДА
// ===============================

const manualWeather = {

    rain: {
        icon: "🌧️",
        name: "Дощ",
        temp: "+12",
        text: "Опади"
    },

    snow: {
        icon: "❄️",
        name: "Сніг",
        temp: "-5",
        text: "Снігопад"
    },

    storm: {
        icon: "⛈️",
        name: "Гроза",
        temp: "+10",
        text: "Гроза"
    },

    fog: {
        icon: "🌫️",
        name: "Туман",
        temp: "+7",
        text: "Видимість знижена"
    }
};


let currentWeather = "clear";

let weatherTimers = [];


function stopWeatherEffects() {

    weatherTimers.forEach(
        clearInterval
    );

    weatherTimers = [];

    weatherEffect.innerHTML = "";
}


function createRainDrop() {

    if (
        currentWeather !== "rain" &&
        currentWeather !== "storm"
    ) {
        return;
    }

    const drop =
        document.createElement("div");

    drop.className =
        "rain-drop";

    drop.style.left =
        `${Math.random() * 100}vw`;

    drop.style.animationDuration =
        `${0.45 + Math.random() * 0.6}s`;

    weatherEffect.appendChild(drop);

    setTimeout(
        () => drop.remove(),
        1600
    );
}


function createSnowflake() {

    if (
        currentWeather !== "snow"
    ) {
        return;
    }

    const snow =
        document.createElement("div");

    snow.className =
        "snowflake";

    snow.textContent = "❄";

    snow.style.left =
        `${Math.random() * 100}vw`;

    snow.style.fontSize =
        `${12 + Math.random() * 25}px`;

    snow.style.animationDuration =
        `${4 + Math.random() * 5}s`;

    weatherEffect.appendChild(snow);

    setTimeout(
        () => snow.remove(),
        10000
    );
}


function createLightning() {

    if (
        currentWeather !== "storm"
    ) {
        return;
    }

    const flash =
        document.createElement("div");

    flash.className =
        "lightning";

    weatherEffect.appendChild(flash);

    setTimeout(
        () => flash.remove(),
        500
    );
}


function startWeatherEffects(type) {

    stopWeatherEffects();

    currentWeather = type;


    if (type === "rain") {

        weatherTimers.push(
            setInterval(() => {

                createRainDrop();
                createRainDrop();
                createRainDrop();

            }, 70)
        );

    }


    else if (type === "snow") {

        weatherTimers.push(
            setInterval(() => {

                createSnowflake();
                createSnowflake();

            }, 180)
        );

    }


    else if (type === "storm") {

        weatherTimers.push(
            setInterval(() => {

                createRainDrop();
                createRainDrop();
                createRainDrop();

            }, 80)
        );

        weatherTimers.push(
            setInterval(
                createLightning,
                2500
            )
        );

    }


    else if (type === "fog") {

        const fog =
            document.createElement("div");

        fog.className =
            "weather-fog";

        weatherEffect.appendChild(fog);
    }
}


// ===============================
// РУЧНА ПОГОДА
// ===============================

function showManualWeather(type) {

    const w =
        manualWeather[type];

    if (!w) {
        return;
    }

    weatherIcon.textContent =
        w.icon;

    weatherType.textContent =
        w.name;

    weatherTemperature.textContent =
        w.temp;

    weatherCity.textContent =
        "Ручний режим";

    weatherText.textContent =
        w.text;


    localStorage.setItem(
        "selectedWeather",
        type
    );

    startWeatherEffects(type);
}


document
    .querySelectorAll("[data-weather]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showManualWeather(
                    button.dataset.weather
                );

            }
        );

    });


// ===============================
// КОДИ ПОГОДИ
// ===============================

function weatherCodeInfo(code) {

    if (code === 0) {
        return [
            "☀️",
            "Ясно",
            "Чисте небо"
        ];
    }

    if ([1, 2, 3].includes(code)) {

        return [
            "🌤️",
            "Хмарно",
            "Мінлива хмарність"
        ];
    }

    if ([45, 48].includes(code)) {

        return [
            "🌫️",
            "Туман",
            "Видимість знижена"
        ];
    }

    if (
        code >= 51 &&
        code <= 67
    ) {

        return [
            "🌧️",
            "Дощ",
            "Опади"
        ];
    }

    if (
        code >= 71 &&
        code <= 86
    ) {

        return [
            "❄️",
            "Сніг",
            "Снігопад"
        ];
    }

    if (code >= 95) {

        return [
            "⛈️",
            "Гроза",
            "Гроза"
        ];
    }

    return [
        "🌤️",
        "Погода",
        "Невідомо"
    ];
}


// ===============================
// ОТРИМАННЯ ПОГОДИ
// ===============================

async function getWeather() {

    weatherType.textContent =
        "Завантаження";

    weatherText.textContent =
        "Отримання погоди";


    try {

        let latitude;
        let longitude;

        let city =
            "Ваше місто";


        try {

            const position =
                await new Promise(
                    (resolve, reject) => {

                        navigator
                            .geolocation
                            .getCurrentPosition(
                                resolve,
                                reject,
                                {
                                    enableHighAccuracy: false,
                                    timeout: 5000,
                                    maximumAge: 600000
                                }
                            );

                    }
                );


            latitude =
                position.coords.latitude;

            longitude =
                position.coords.longitude;

        }


        catch {

            const locResponse =
                await fetch(
                    "https://ipapi.co/json/"
                );


            if (!locResponse.ok) {
                throw new Error(
                    "Не вдалося визначити місцезнаходження"
                );
            }


            const loc =
                await locResponse.json();


            latitude =
                loc.latitude;

            longitude =
                loc.longitude;

            city =
                loc.city ||
                city;
        }


        const weatherResponse =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "Не вдалося отримати погоду"
            );
        }


        const data =
            await weatherResponse.json();


        const code =
            data.current.weather_code;


        const temperature =
            Math.round(
                data.current.temperature_2m
            );


        if (
            city === "Ваше місто"
        ) {

            try {

                const loc =
                    await (
                        await fetch(
                            "https://ipapi.co/json/"
                        )
                    ).json();

                city =
                    loc.city ||
                    city;

            } catch {}
        }


        const [
            icon,
            name,
            text
        ] =
            weatherCodeInfo(code);


        weatherIcon.textContent =
            icon;

        weatherType.textContent =
            name;

        weatherTemperature.textContent =
            temperature;

        weatherCity.textContent =
            city;

        weatherText.textContent =
            text;


        if (
            code >= 51 &&
            code <= 67
        ) {

            startWeatherEffects(
                "rain"
            );

        }

        else if (
            code >= 71 &&
            code <= 86
        ) {

            startWeatherEffects(
                "snow"
            );

        }

        else if (
            code >= 95
        ) {

            startWeatherEffects(
                "storm"
            );

        }

        else if (
            code === 45 ||
            code === 48
        ) {

            startWeatherEffects(
                "fog"
            );

        }

        else {

            startWeatherEffects(
                "clear"
            );
        }


    }

    catch (error) {

        console.warn(
            "Погода недоступна:",
            error
        );


        weatherIcon.textContent =
            "🌤️";

        weatherType.textContent =
            "Офлайн";

        weatherTemperature.textContent =
            "--";

        weatherCity.textContent =
            "Погода недоступна";

        weatherText.textContent =
            "Використайте кнопки нижче";

        stopWeatherEffects();
    }
}


weatherRefresh.addEventListener(
    "click",
    getWeather
);


// ===============================
// КВЕСТИ
// ===============================

const quests = [

    {
        id: 1,
        level: 1,
        title: "Перша чашка",
        description: "Випий свою першу чашку чаю.",
        goal: 1,
        reward: 10,
        icon: "🍵",
        type: "cups"
    },

    {
        id: 2,
        level: 1,
        title: "Маленький початок",
        description: "Випий 500 мл чаю.",
        goal: 500,
        reward: 20,
        icon: "🌱",
        type: "totalVolume"
    },

    {
        id: 3,
        level: 1,
        title: "Чайний день",
        description: "Випий 1 літр чаю за день.",
        goal: 1000,
        reward: 30,
        icon: "☕",
        type: "todayVolume"
    },

    {
        id: 4,
        level: 2,
        title: "Чайний ентузіаст",
        description: "Випий 2 літри чаю за один день.",
        goal: 2000,
        reward: 50,
        icon: "🔥",
        type: "todayVolume"
    },

    {
        id: 5,
        level: 2,
        title: "П'ять чашок",
        description: "Випий чай 5 разів.",
        goal: 5,
        reward: 60,
        icon: "🍵",
        type: "cups"
    },

    {
        id: 6,
        level: 2,
        title: "Чайний тиждень",
        description: "Веди історію чаю протягом 7 різних днів.",
        goal: 7,
        reward: 100,
        icon: "📅",
        type: "days"
    },

    {
        id: 7,
        level: 3,
        title: "Майстер чаю",
        description: "Випий загалом 5 літрів чаю.",
        goal: 5000,
        reward: 150,
        icon: "👑",
        type: "totalVolume"
    },

    {
        id: 8,
        level: 3,
        title: "Чайний марафон",
        description: "Веди історію чаю протягом 14 різних днів.",
        goal: 14,
        reward: 200,
        icon: "🏆",
        type: "days"
    },

    {
        id: 9,
        level: 3,
        title: "Великий запас",
        description: "Випий загалом 10 літрів чаю.",
        goal: 10000,
        reward: 300,
        icon: "💎",
        type: "totalVolume"
    }
];


// ===============================
// ПРОГРЕС КВЕСТІВ
// ===============================

function loadQuestProgress() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    QUEST_STORAGE_KEY
                ) || "{}"
            );

        return data &&
            typeof data === "object"
            ? data
            : {};

    } catch {

        return {};
    }
}


let questProgress =
    loadQuestProgress();


function saveQuestProgress() {

    localStorage.setItem(
        QUEST_STORAGE_KEY,
        JSON.stringify(
            questProgress
        )
    );
}


// ===============================
// ЗНАЧЕННЯ КВЕСТІВ
// ===============================

function getTotalTeaVolume() {

    return teaHistory.reduce(
        (sum, item) =>
            sum +
            (Number(item.volume) || 0),
        0
    );
}


function getTotalTeaCups() {

    return teaHistory.length;
}


function getUniqueTeaDays() {

    return new Set(
        teaHistory.map(
            item => item.date
        )
    ).size;
}


function calculateQuestProgress(q) {

    if (q.type === "cups") {

        return Math.min(
            getTotalTeaCups(),
            q.goal
        );
    }


    if (q.type === "totalVolume") {

        return Math.min(
            getTotalTeaVolume(),
            q.goal
        );
    }


    if (q.type === "todayVolume") {

        return Math.min(
            getTodayTea(),
            q.goal
        );
    }


    if (q.type === "days") {

        return Math.min(
            getUniqueTeaDays(),
            q.goal
        );
    }


    return 0;
}


// ===============================
// РІВНІ
// ===============================

function isLevelUnlocked(level) {

    if (level === 1) {
        return true;
    }

    return quests
        .filter(
            q => q.level === level - 1
        )
        .every(
            q =>
                questProgress[q.id]?.completed
        );
}


function getLevelData() {

    const xp =
        Number(
            localStorage.getItem(
                XP_STORAGE_KEY
            )
        ) || 0;


    const level =
        Number(
            localStorage.getItem(
                LEVEL_STORAGE_KEY
            )
        ) || 1;


    return {
        xp,
        level
    };
}


function saveLevelData(
    xp,
    level
) {

    localStorage.setItem(
        XP_STORAGE_KEY,
        String(xp)
    );

    localStorage.setItem(
        LEVEL_STORAGE_KEY,
        String(level)
    );
}


// ===============================
// XP
// ===============================

function addXP(amount) {

    let {
        xp,
        level
    } = getLevelData();


    xp += amount;


    let needed =
        level * 100;


    let leveledUp =
        false;


    while (
        xp >= needed
    ) {

        xp -= needed;

        level++;

        needed =
            level * 100;

        leveledUp =
            true;
    }


    saveLevelData(
        xp,
        level
    );


    if (leveledUp) {

        showQuestNotification(
            "🎉 Новий рівень!",
            `Тепер у тебе рівень ${level}!`
        );
    }
}


// ===============================
// НАЗВА РІВНЯ
// ===============================

function getLevelTitle(level) {

    if (level >= 10) {
        return "Легенда чаю";
    }

    if (level >= 7) {
        return "Чайний геній";
    }

    if (level >= 5) {
        return "Майстер";
    }

    if (level >= 3) {
        return "Знавець чаю";
    }

    if (level >= 2) {
        return "Ентузіаст";
    }

    return "Новачок";
}


// ===============================
// ІНТЕРФЕЙС РІВНЯ
// ===============================

function updateLevelUI() {

    const {
        xp,
        level
    } = getLevelData();


    const needed =
        level * 100;


    $("teaLevel").textContent =
        level;


    $("teaLevelTitle").textContent =
        getLevelTitle(level);


    $("teaXP").textContent =
        xp;


    $("teaXPNeeded").textContent =
        needed;


    $("teaXPBar").style.width =
        `${Math.min(
            (xp / needed) * 100,
            100
        )}%`;
}


// ===============================
// ПОВІДОМЛЕННЯ
// ===============================

function showQuestNotification(
    title,
    text
) {

    const box =
        $("questNotification");


    $("questNotificationTitle")
        .textContent =
        title;


    $("questNotificationText")
        .textContent =
        text;


    box.classList.add(
        "show"
    );


    clearTimeout(
        showQuestNotification.timer
    );


    showQuestNotification.timer =
        setTimeout(
            () =>
                box.classList.remove(
                    "show"
                ),
            3500
        );
}


// ===============================
// ОНОВЛЕННЯ ПРОГРЕСУ
// ===============================

function updateQuestProgress() {

    quests.forEach(q => {

        if (!questProgress[q.id]) {

            questProgress[q.id] = {

                progress: 0,

                completed: false,

                rewardGiven: false
            };
        }


        const saved =
            questProgress[q.id];


        saved.progress =
            calculateQuestProgress(q);


        if (
            saved.progress >= q.goal &&
            !saved.completed
        ) {

            saved.completed =
                true;
        }


        if (
            saved.completed &&
            !saved.rewardGiven
        ) {

            saved.rewardGiven =
                true;


            addXP(
                q.reward
            );


            showQuestNotification(
                "🏆 Квест виконано!",
                `+${q.reward} XP — ${q.title}`
            );
        }
    });


    saveQuestProgress();
}


// ===============================
// ВИВІД КВЕСТІВ
// ===============================

function formatQuestProgress(
    q,
    value
) {

    if (
        q.type === "totalVolume" ||
        q.type === "todayVolume"
    ) {

        return `${formatVolume(value)} / ${formatVolume(q.goal)}`;
    }


    return `${value} / ${q.goal}`;
}


function renderQuests() {

    const list =
        $("questsList");


    list.innerHTML = "";


    const levels =
        [
            ...new Set(
                quests.map(
                    q => q.level
                )
            )
        ];


    levels.forEach(level => {

        const unlocked =
            isLevelUnlocked(level);


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "quest-level-title";


        title.innerHTML = `
            <h2>
                ${
                    level === 1
                        ? "🟢"
                        : level === 2
                            ? "🔵"
                            : "🟣"
                }
                Рівень ${level}
            </h2>

            <span>
                ${
                    unlocked
                        ? "Відкрито"
                        : "🔒 Заблоковано"
                }
            </span>
        `;


        list.appendChild(
            title
        );


        quests
            .filter(
                q => q.level === level
            )
            .forEach(q => {

                const saved =
                    questProgress[q.id];


                const progress =
                    saved?.progress || 0;


                const completed =
                    !!saved?.completed;


                const locked =
                    !unlocked;


                const percent =
                    Math.min(
                        (progress / q.goal) * 100,
                        100
                    );


                const el =
                    document.createElement(
                        "div"
                    );


                el.className =
                    `quest${
                        completed
                            ? " completed"
                            : ""
                    }${
                        locked
                            ? " locked"
                            : ""
                    }`;


                el.innerHTML = `

                    <div class="quest-icon">

                        ${
                            locked
                                ? "🔒"
                                : q.icon
                        }

                    </div>


                    <div class="quest-content">

                        <h3>
                            ${q.title}
                        </h3>


                        <p>

                            ${
                                locked
                                    ? "Виконайте всі квести попереднього рівня."
                                    : q.description
                            }

                        </p>


                        ${
                            locked
                                ? ""
                                : `

                                    <div class="quest-progress">

                                        <div class="quest-progress-bar">

                                            <div
                                                class="quest-progress-fill"
                                                style="width:${percent}%"
                                            ></div>

                                        </div>


                                        <span class="quest-progress-text">

                                            ${
                                                formatQuestProgress(
                                                    q,
                                                    progress
                                                )
                                            }

                                        </span>

                                    </div>
                                `
                        }

                    </div>


                    <div class="quest-reward">

                        🪙 ${q.reward} XP

                    </div>


                    ${
                        completed
                            ? '<div class="quest-completed">✅</div>'
                            : ""
                    }

                `;


                list.appendChild(
                    el
                );
            });
    });
}


// ===============================
// ЛІЧИЛЬНИК КВЕСТІВ
// ===============================

function updateQuestStats() {

    const completed =
        quests.filter(
            q =>
                questProgress[q.id]
                    ?.completed
        ).length;


    $("questsCompleted")
        .textContent =
        completed;


    $("questsTotal")
        .textContent =
        quests.length;
}


function updateQuests() {

    updateQuestProgress();

    renderQuests();

    updateQuestStats();

    updateLevelUI();
}


// ===============================
// СКИДАННЯ КВЕСТІВ
// ===============================

$("resetQuestsButton")
    .addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Скинути весь прогрес квестів і XP?"
                )
            ) {
                return;
            }


            questProgress = {};


            localStorage.removeItem(
                QUEST_STORAGE_KEY
            );


            localStorage.removeItem(
                XP_STORAGE_KEY
            );


            localStorage.removeItem(
                LEVEL_STORAGE_KEY
            );


            updateQuests();


            alert(
                "Прогрес квестів скинуто!"
            );
        }
    );


// ===============================
// ЗАПУСК САЙТУ
// ===============================

updateCupLimit();

updateTodayCounter();

updateStatistics();

updateTeaChart();

updateQuests();


const savedWeather =
    localStorage.getItem(
        "selectedWeather"
    );


if (
    savedWeather &&
    manualWeather[savedWeather]
) {

    showManualWeather(
        savedWeather
    );

} else {

    getWeather();
}
// ===== Currency list (your existing feature, with KMP search) =====
const inputEl = document.getElementById("currencyInput");
const addBtn = document.getElementById("addButton");
const searchEl = document.getElementById("searchInput");
const listEl = document.getElementById("currencyList");

const items = [];

// KMP substring search
function kmpIndexOf(text, pattern) {
  if (pattern.length === 0) return 0;

  const lps = new Array(pattern.length).fill(0);
  for (let i = 1, len = 0; i < pattern.length; ) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len > 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }

  for (let i = 0, j = 0; i < text.length; ) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === pattern.length) return i - j;
    } else if (j > 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return -1;
}

function searchString(element, searchWord) {
  const text = element.toLowerCase();
  const pat  = (searchWord || "").toLowerCase();
  if (!pat) return true;
  return kmpIndexOf(text, pat) !== -1;
}

function searchList(list, searchWord) {
  if (!searchWord) return list.slice();
  return list.filter((e) => searchString(e, searchWord));
}

function renderCurrencies() {
  const query = searchEl.value.trim();
  const view = searchList(items, query);
  listEl.innerHTML = "";

  view.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "8px";
    delBtn.addEventListener("click", () => {
      const idx = items.findIndex((x) => x.toLowerCase() === text.toLowerCase());
      if (idx !== -1) items.splice(idx, 1);
      renderCurrencies();
    });

    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

function addCurrency() {
  const value = inputEl.value.trim();
  if (!value) return;
  items.push(value);
  inputEl.value = "";
  inputEl.focus();
  renderCurrencies();
}

addBtn.addEventListener("click", addCurrency);
inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") addCurrency(); });
searchEl.addEventListener("input", renderCurrencies);

// Seed examples
items.push("Norwegian Kroner");
items.push("Swedish Kronor");
renderCurrencies();

// ===== Country populations (new feature) =====
const BASE_URL = "https://d6wn6bmjj722w.population.io/1.0";

const countrySearchEl = document.getElementById("countrySearch");
const sortSelect      = document.getElementById("sortSelect");
const countryTableTbody = document.querySelector("#countryTable tbody");
const countryStatusEl = document.getElementById("countryStatus");

let countriesData = [];
let loaded = false;

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} – ${text || url}`);
  }
  return res.json();
}

async function fetchCountries() {
  const data = await fetchJSON(`${BASE_URL}/countries`);
  const list = Array.isArray(data?.countries) ? data.countries : [];
  const AGG_KEYWORDS = /(world|region|income|countries|areas|sub-saharan|latin america|caribbean|oceania|europe|africa|asia|northern america|eastern asia|western asia|southern asia|western europe|eastern europe|northern europe|southern europe|melanesia|micronesia|polynesia)/i;
  return list.filter((name) => !AGG_KEYWORDS.test(name));
}


async function fetchTodayPopulation(country) {
  const enc = encodeURIComponent(country);
  const data = await fetchJSON(`${BASE_URL}/population/${enc}/today-and-tomorrow/`);
  let pop = 0;
  if (Array.isArray(data?.total_population) && data.total_population[0]?.population != null) {
    pop = Number(data.total_population[0].population) || 0;
  } else if (data?.total_population?.population != null) {
    pop = Number(data.total_population.population) || 0;
  }
  return { country, population: pop };
}

async function mapWithConcurrency(items, mapper, limit = 8) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      try {
        results[idx] = await mapper(items[idx], idx);
      } catch (err) {
        results[idx] = { country: items[idx], population: 0, error: String(err?.message || err) };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function currentSortedTop() {
  const q = (countrySearchEl.value || "").trim().toLowerCase();

  let view = countriesData.filter(row => {
    if (!q) return true;
    return kmpIndexOf(row.country.toLowerCase(), q) !== -1;
  });

  const [key, dir] = sortSelect.value.split(":");
  view.sort((a, b) => {
    let av = key === "population" ? (a.population || 0) : a.country;
    let bv = key === "population" ? (b.population || 0) : b.country;
    const cmp = key === "population" ? (av - bv) : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });

  return view.slice(0, 10);
}

function renderCountries() {
  const rows = currentSortedTop();
  countryTableTbody.innerHTML = "";

  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    const n  = document.createElement("td");
    const c  = document.createElement("td");
    const p  = document.createElement("td");

    n.textContent = String(idx + 1);
    c.textContent = row.country;
    p.textContent = (row.population ?? 0).toLocaleString();

    tr.appendChild(n); tr.appendChild(c); tr.appendChild(p);
    countryTableTbody.appendChild(tr);
  });

  const filteredCount = (countrySearchEl.value || "").trim() ? " (filtered)" : "";
  countryStatusEl.textContent = loaded
    ? `Showing ${rows.length} of ${countriesData.length} countries${filteredCount}.`
    : `Loading countries…`;
}

async function initCountries() {
  try {
    countryStatusEl.textContent = "Loading countries…";
    const countries = await fetchCountries();
    if (!countries.length) throw new Error("No countries returned from API.");

    countriesData = await mapWithConcurrency(countries, fetchTodayPopulation, 8);
    loaded = true;

    sortSelect.value = "population:desc";
    renderCountries();
  } catch (err) {
    loaded = true;
    countriesData = [];
    renderCountries();
    countryStatusEl.textContent = `Failed to load: ${String(err?.message || err)}`;
  }
}

countrySearchEl.addEventListener("input", renderCountries);
sortSelect.addEventListener("change", renderCountries);

initCountries();

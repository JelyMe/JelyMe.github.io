// #region Loader
const loader = document.querySelector(".loader-container");

window.addEventListener("load", () => { 
  loader.style.display = "none";
});
// #endregion

// #region Scrollbar
function hexToRgb(hex) {
  return {
    r: parseInt(hex.substring(1, 3), 16),
    g: parseInt(hex.substring(3, 5), 16),
    b: parseInt(hex.substring(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function interpolate(color1, color2, percent) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const interpolateValue = (start, end) =>
    Math.round(start + (end - start) * percent);

  return rgbToHex({
    r: interpolateValue(rgb1.r, rgb2.r),
    g: interpolateValue(rgb1.g, rgb2.g),
    b: interpolateValue(rgb1.b, rgb2.b),
  });
}

const debounce = (fn) => {
  let frame;
  return (...params) => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => fn(...params));
  };
};

const searchResults = document.querySelector(".search-results");

const storeScroll = () => {
  let scrollamount = searchResults.scrollTop / searchResults.scrollHeight;
  searchResults.style.setProperty(
    "--scroll-amount",
    interpolate("#4287f5", "#460c85", scrollamount)
  );
};

searchResults.addEventListener("scroll", debounce(storeScroll), { passive: true });

storeScroll();
// #endregion

// #region Fetching Data Securely
let idx, fullData, subjectList;

fetch("subjects.json")
  .then((res) => res.json())
  .then((data) => {
    subjectList = data;
  });

fetch("searchIndex.json")
  .then((res) => res.json())
  .then((data) => {
    idx = lunr(function () {
      this.ref("id");
      this.field("title");
      this.field("subject");
      this.field("number");
      this.field("credits");
      data.forEach((doc) => this.add(doc), this);
    });
    fullData = data;
  });
// #endregion

// #region Searching Logic
const searchText = document.querySelector("#search-text");
const autocomplete = document.querySelector("#autocomplete");

function sanitizeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML; // Escapes any potentially harmful HTML
}

function setAutoCompleteText() {
  autocomplete.textContent = searchText.value; // Use textContent instead of innerHTML

  if (searchText.value.length !== 0) {
    for (let subject of subjectList) {
      if (subject.toLowerCase().startsWith(searchText.value.toLowerCase())) {
        autocomplete.textContent = subject;
        searchText.value = subject;
        break;
      }
    }
  } else {
    autocomplete.textContent = "Enter standard number or subject name";
  }
}

function extractSearchData(search) {
  const creditsRegex = /mincredits:(\d+)/i;
  const creditsMatch = search.match(creditsRegex);
  const minCredits = creditsMatch ? parseInt(creditsMatch[1], 10) : null;
  search = search.replace(creditsRegex, "").trim();

  const levelRegex = /level:(\d+|S)/i;
  const levelMatch = search.match(levelRegex);
  const level = levelMatch ? levelMatch[1] : null;
  search = search.replace(levelRegex, "").trim();

  return { search, minCredits, level };
}

function showSearchResults() {
  searchResults.innerHTML = "";
  
  const { search, minCredits, level } = extractSearchData(searchText.value);
  let subjectExams = idx.search(search);

  if (minCredits) {
    subjectExams = subjectExams.filter((result) => fullData[result.ref]["credits"] >= minCredits);
  }
  if (level) {
    subjectExams = subjectExams.filter(
      (result) => fullData[result.ref]["level"] == level || fullData[result.ref]["level"] == "All"
    );
  }

  if (subjectExams.length > 0) {
    subjectExams.forEach((result) => {
      const card = document.createElement("div");
      card.classList.add("search-results-card", "flex-c-c");

      card.innerHTML = `
        <div class="standard-info flex-c-s flex-column">
          <div class="standard-info-numbers flex-se-c">
            <h1 class="standard-info-id inter-light">${sanitizeText(fullData[result.ref]["number"])}</h1>
            <h4 class="standard-info-time-period inter-light">${sanitizeText(fullData[result.ref]["start-year"])} - ${sanitizeText(fullData[result.ref]["end-year"])}</h4>
          </div>
          <div class="standard-info-description inconsolata">
            <p>${sanitizeText(fullData[result.ref]["title"])} | Credits: ${sanitizeText(fullData[result.ref]["credits"].toString())}</p>
          </div>
        </div>
        <div class="split-bar"></div>
        <div class="standard-level">
          <h1 class="standard-level-text inter-light">${sanitizeText(fullData[result.ref]["level"])}</h1>
          <p>Lvl</p>
        </div>
        <button class="download-plus">
          <img src="Images/DownloadIcon.png">
        </button>
      `;

      card.querySelector(".download-plus").addEventListener("click", () => {
        window.open(
          `https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/${sanitizeText(fullData[result.ref]["number"])}.zip`
        );
      });

      searchResults.appendChild(card);
    });
  } else {
    searchResults.innerHTML = "<p>No results found.</p>";
  }
}

document.querySelector("#search-text").addEventListener("keydown", (event) => {
  if (event.keyCode === 9 && autocomplete.textContent !== "Enter standard number or subject name") {
    event.preventDefault();
    searchText.value = autocomplete.textContent;
  }
});

document.querySelector("#search-text").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) showSearchResults();
  setAutoCompleteText();
});
// #endregion

// #region Subjects Screen
let showingSubjects = false;

document.querySelector("#subject-button").addEventListener("click", () => {
  searchResults.innerHTML = showingSubjects ? "" : subjectList.map((subject) =>
    `<button class="subject-card inter-light flex-c-c">${sanitizeText(subject)}</button>`
  ).join("\n");

  showingSubjects = !showingSubjects;
});

searchResults.addEventListener("click", (event) => {
  if (event.target.classList.contains("subject-card")) {
    searchText.value = event.target.textContent;
    showSearchResults();
  }
});
// #endregion

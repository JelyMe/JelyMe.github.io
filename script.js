// #region Loader
const loader = document.querySelector(".loader-container");

window.addEventListener("load", () => { 
  loader.style.display = "none";
});
// #endregion

// --- Added sanitization helper function ---
function escapeHTML(str) {
  if (typeof str !== "string") {
    str = String(str);
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// #region Scrollbar
// Helper function to convert a hex color to RGB
function hexToRgb(hex) {
  return {
    r: parseInt(hex.substring(1, 3), 16),
    g: parseInt(hex.substring(3, 5), 16),
    b: parseInt(hex.substring(5, 7), 16),
  };
}

// Helper function to convert RGB values to a hex color
function rgbToHex({ r, g, b }) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Main function to interpolate between two colors
function interpolate(color1, color2, percent) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const interpolateValue = (start, end) =>
    Math.round(start + (end - start) * percent);

  const interpolatedColor = {
    r: interpolateValue(rgb1.r, rgb2.r),
    g: interpolateValue(rgb1.g, rgb2.g),
    b: interpolateValue(rgb1.b, rgb2.b),
  };

  return rgbToHex(interpolatedColor);
}

const debounce = (fn) => {
  let frame;

  return (...params) => {
    if (frame) { 
      cancelAnimationFrame(frame);
    }

    frame = requestAnimationFrame(() => {
      fn(...params);
    });

  } 
};

const searchResults = document.querySelector('.search-results')

const storeScroll = () => {
  let scrollamount = (searchResults.scrollTop / searchResults.scrollHeight);
  searchResults.style.setProperty("--scroll-amount", interpolate("#4287f5","#460c85", scrollamount));
}

searchResults.addEventListener('scroll', debounce(storeScroll), { passive: true });

storeScroll();
// #endregion

// #region Prepare necessary variables for searching
// Searching
let idx;

let fullData;

let subjectList;

fetch("subjects.json")
  .then((res) => res.json())
  .then((data)=>{
    subjectList = data;
  });

fetch("searchIndex.json")
  .then((res) => res.json())
  .then((data) => {  
    idx = lunr(function () {
      this.ref('id');
      this.field('title');
      this.field('subject');
      this.field('number');
      this.field('credits');
        
      data.forEach(function (doc) {
        this.add(doc)
      }, this)
    })
      
    fullData = data;
});
// #endregion

// #region Searching Logic
// Screens
const contributorsScreen = document.querySelector(".contributors-screen");
const examsNotFound = document.querySelector(".subject-not-found-block");
const loadingWheel = document.querySelector(".loading-wheel");
const githubContributeScreen = document.querySelector(
  ".github-contribute-screen"
);

// Texts in input field
const searchText = document.querySelector("#search-text");
// Use textContent when simply displaying text to avoid HTML injection.
const autocomplete = document.querySelector("#autocomplete");
const minCredits = 0

function setAutoCompleteText() {
  // Use textContent instead of innerHTML for user-supplied text.
  autocomplete.textContent = searchText.value;

  if (searchText.value.length != 0) {
    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];

      if (
        subject.toLowerCase().substr(0, searchText.value.length) ==
        searchText.value.toLowerCase()
      ) {
        // Set the autocomplete text safely
        autocomplete.textContent = subject;

        let autoCompleteContent = subject
          .substr(0, searchText.value.length)
          .replace("&amp;", "&");

        searchText.value = autoCompleteContent;
        break;
      }
    }
  } else {
    // Set a safe default text message
    autocomplete.textContent = "Enter standard number or subject name";
  }
}

function changeScreensDisplay(
  examsNotFoundDisplay,
  searchResultsDisplay,
  loadingWheelDisplay,
  contributorsScreenDisplay
) {
  examsNotFound.style.display = examsNotFoundDisplay;
  searchResults.style.display = searchResultsDisplay;
  loadingWheel.style.display = loadingWheelDisplay;
  contributorsScreen.style.display = contributorsScreenDisplay;

  // Always disable githubContribtuteScreen
  githubContributeScreen.style.display = "none";
}

function addFilter(filter) {
  // Add space if there's already text in the bar
  if (searchText.value != "") {
    searchText.value += " ";
  }

  searchText.value += filter;
  autocomplete.textContent = "";
  searchText.focus();
}

function extractSearchData(search) {
  // Credit Selector
  // Matchs mincredits: then a number, and the i at the end means it's case insensitive
  const creditsRegex = /mincredits:(\d+)/i;
  const creditsMatch = search.match(creditsRegex);
  const minCredits = creditsMatch ? parseInt(creditsMatch[1], 10) : null;
  search = search.replace(creditsRegex, '').trim();

  // Level selector
  // Matchs level: then a number or S, and the i at the end means it's case insensitive
  const levelRegex = /level:(\d+|S)/i;
  const levelMatch = search.match(levelRegex);
  const level = levelMatch ? levelMatch[1] : null;
  search = search.replace(levelRegex, '').trim();

  // Search query sanitization 
  // Adds a plus before each word so that lunr matches it properly
  const sanitizationRegex = /(?<![+-])\b([A-Z][^+\s]+)\b/g;
  search = search.replace(sanitizationRegex, "+$1");

  return ({
    search,
    minCredits,
    level
  });
}

function showSearchResults() {
  // Remove current search results
  searchResults.innerHTML = "";

  changeScreensDisplay("none", "none", "flex", "none");

  new Promise(
    (resolve, reject) => {
      setTimeout(() => {
        const { search, minCredits, level } = extractSearchData(searchText.value);

        let subjectExams = idx.search(search);
        // Filtering
        if (minCredits) {
          subjectExams = subjectExams.filter((result) => fullData[result.ref]['credits'] >= minCredits );
        }
        if (level) {
          subjectExams = subjectExams.filter((result) => fullData[result.ref]['level'] == level || fullData[result.ref]['level'] == "All");
        }

        if (subjectExams.length > 0) {
          // Add the exam card buttons for each exam there are for that subject
          subjectExams.forEach((result) => {
            // Sanitize each dynamic field
            const examNumber = escapeHTML(fullData[result.ref]["number"]);
            const startYear = escapeHTML(fullData[result.ref]["start-year"]);
            const endYear = escapeHTML(fullData[result.ref]["end-year"]);
            const examTitle = escapeHTML(fullData[result.ref]["title"]);
            const creditsText = escapeHTML(fullData[result.ref]["credits"]);
            const examLevel = escapeHTML(fullData[result.ref]["level"]);
            // For URL parts, use encodeURIComponent
            const examNumberURL = encodeURIComponent(fullData[result.ref]["number"]);

            searchResults.innerHTML += 
            `<div class="search-results-card flex-c-c">
              <div class="standard-info flex-c-s flex-column">
                <div class="standard-info-numbers flex-se-c">
                  <h1 class="standard-info-id inter-light">
                    ${examNumber}
                  </h1>
                  <h4 class="standard-info-time-period inter-light">
                  ${startYear}-${endYear}
                  </h4>
                </div>
                <div class="standard-info-description inconsolata">
                  <p>${examTitle} | Credits: ${creditsText}</p>
                </div>
              </div>
        
              <div class="split-bar"></div>
        
              <div class="standard-level">
                <h1 class="standard-level-text inter-light">
                  ${examLevel}
                </h1>
              <p>Lvl</p>
              </div>
        
              <button class="download-plus" onclick="window.open('https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/${examNumberURL}.zip')">
              <img src="Images/DownloadIcon.png"></button>
      
            </div>`;
          });
          
          resolve();
        }
        else if (subjectExams.length === 0) {
          // If there are no exams for that subject, show the error screen (why face emoji)
          changeScreensDisplay("flex", "none", "none", "none");
        }

      }, 15);
      /* 
      We added a 5 millisecond delay because of a behaviour in JavaScript
      Seems like "tasks" in JavaScript will be blocking, until a certain task is done JavaScript
      will move onto the next task. Thus, adding a 5 millisecond delay to this will allow the loading
      wheel to show
      */
    }
  ).then(
    () => {
      // Once exams are found show the search results
      changeScreensDisplay("none", "flex", "none", "none");
    }
  );
}

const tabKeyCode = 9;
const enterKeyCode = 13;

//Stupid tab button, it has to be done on the keydown event because when keyup, the focus will have been shifted
document.querySelector('#search-text').addEventListener('keydown', (event) => {  

  /*
    Why we use autocomplete.textContent instead of innerHTML:
    This is because Earth & Space Science has an ampersand, which is displayed as &amp; in HTML.
    If we use autocomplete.innerHTML, then we are comparing searchText.value (which is plain) text, 
    with HTML markup.
    This leads to errors such as when autocompleting for Earth & Space Science, the searchText will
    be displayed as "Earth &amp; Space Science".
    To avoid this we have to use the raw plain text of autocomplete. Hence, we use textContent.
  */
 
  // Keycode 9 is tab key
  if (event.keyCode == tabKeyCode && autocomplete.textContent != "Enter standard number or subject name") {
    // Prevents pressing the tab key to select elements
    event.preventDefault();

    if (searchText.value == autocomplete.textContent) {
      showSearchResults();
    }
    else {
      // If the current input text is not equal to autoComplete's text, will auto complete
      searchText.value = autocomplete.textContent;
    }
  }
});

// Enter key autocomplete and stuff. Done on keyup because enter key is not special like tab
document.querySelector('#search-text').addEventListener('keyup', (event) => {

  // Key code 13 is enter key
  if (event.keyCode == enterKeyCode && autocomplete.textContent != "Enter standard number or subject name") {

    if (searchText.value == autocomplete.textContent) {
     showSearchResults();
    }
    else {
      // If the current input text is not equal to autoComplete's text, will auto complete
      searchText.value = autocomplete.textContent;
    }
  }

  setAutoCompleteText();
});
// #endregion

// #region Contributors Screen
// Contributors button
const contributorsButton = document.querySelector(".contributors-button");

contributorsButton.addEventListener("click", (e) => {
  if (contributorsScreen.style.display === "flex") {
    // Display search results
    changeScreensDisplay("none", "flex", "none", "none");
  } else {
    /*
    Will stop the click event fired by the user clicking
    from going up to the body. If this was not included, then
    the body click event will be fired and code will be executed
    (the code to be executed is below this callback function)
    */
    e.stopPropagation();

    changeScreensDisplay("none", "none", "none", "flex");
  }
});

/* 
If the user clicks anywhere on the screen, and the contributors screen is showing, 
then will hide contributor screen and show the exam paper search results
*/
document.body.addEventListener("click", () => {
  if (contributorsScreen.style.display === "flex") {
    // Display search results
    changeScreensDisplay("none", "flex", "none", "none");
  }
});
// #endregion

// #region Subjects Screen
let showingSubjects = false;

document.querySelector("#subject-button").addEventListener("click", ()=>{
  if (!showingSubjects) {

    // Remove search results
    searchResults.innerHTML = "";

    changeScreensDisplay("none", "flex", "none", "none");
    
    // Show subject list buttons
    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];
      // Use JSON.stringify to safely pass the subject string into the onclick handler,
      // and escapeHTML for the button's inner text.
      searchResults.innerHTML += `<button class="subject-card inter-light flex-c-c" onclick="search(${JSON.stringify(subject)})">` + escapeHTML(subject) + '</button>\n';
    }
    showingSubjects = true;
  }
  else {
    // Hides the subject list buttons
    searchResults.innerHTML = "";
    showingSubjects = false;
  }
})

// Searching for subject exams from clicking the subject buttons
function search(term){
  autocomplete.textContent = term;
  searchText.value = term;

  showSearchResults();
}
// #endregion

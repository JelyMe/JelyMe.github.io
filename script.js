// --- Added sanitization helper function ---
function escapeHTML(str) {
  // String(string) is still a string.
  return String(str)
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

var searchResults;
var subjectSelect;
runOnDocumentLoad(function() {
  searchResults = document.getElementById("search-results");
  subjectSelect = document.getElementById("subject-select");
  searchResults.addEventListener('scroll', storeScroll, { passive: true});

  storeScroll();
});

const storeScroll = () => {
  let scrollamount = searchResults.scrollTop / searchResults.scrollHeight;
  // `scrollamount ? scrollamount : 0` --> If `scrollamount` is `NaN`, we just return the beginning value (0).
  searchResults.style.setProperty("--scroll-amount", interpolate("#4287f5","#460c85", scrollamount ? scrollamount : 0));
}
// #endregion

// #region Prepare necessary variables for searching
// Searching
let idx;

let fullData;

let subjectList = [];
let relevant_subject_list = [];

window.addEventListener('load', function() {
  fetch("./subjects.json")
    .then((res) => res.json())
    .then((data)=>{
      subjectList = data;
      relevant_subject_list = data;

    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];
      if (subject == "Earth and Space Science") { continue; }

      // Use JSON.stringify to safely pass the subject string into the onclick handler,
      // and escapeHTML for the button's inner text.
      let subjectButton = document.createElement("button");
      subjectButton.classList.add("subject-card", "inter-light", "flex-c-c");
      subjectButton.onclick = function() { search(subject) };
      subjectButton.textContent = subject;
      subjectSelect.appendChild(subjectButton);
    }
  });
  fetch("./searchIndex.json")
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
});
// #endregion

// #region Searching Logic
// Texts in input field
let searchText;
let autocomplete;
const minCredits = 0
const default_searchtext = "Enter standard number or subject name";

runOnDocumentLoad(function() {
  searchText = document.getElementById("search-text");
  autocomplete = document.getElementById("autocomplete");
  //Stupid tab button, it has to be done on the keydown event because when keyup, the focus will have been shifted
  searchText.addEventListener('keydown', handleAutocomplete, { passive: true });

  searchText.addEventListener('input', setAutoCompleteText);
});

function setAutoCompleteText() {
  // Use textContent instead of innerHTML for user-supplied text.
  const text = searchText.value;

  relevant_subject_list = subjectList;

  if (text.length == 0) {
    // Set a safe default text message
    autocomplete.textContent = default_searchtext;

    selectScreen(screen.welcome);
    previous_search = "";
    return;
  }

  let delete_list = [];
  let matches_list = [];
  let shortestMatch;

  for (let i = 0; i < relevant_subject_list.length; i++) {
    const subject = relevant_subject_list[i];

    if (subject.toLowerCase().substr(0, text.length) == text.toLowerCase()) {
      if (!shortestMatch) {
        shortestMatch = subject;
      } else if (subject.length < shortestMatch.length) {
        shortestMatch = subject;
      }

      matches_list.push(subject);
    }
    else delete_list.push(subject);
  }
  relevant_subject_list = matches_list;
  console.log(relevant_subject_list);

  matches_list.push(text);
  autocomplete_item = shortestMatch ? shortestMatch : text;
  autocomplete_item = text + autocomplete_item.substr(text.length, autocomplete_item.length);
  autocomplete.textContent = autocomplete_item;
}

function addFilter(filter) {
  if (searchText.value !== "") {
    // Add space if there's already text in the bar
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
  //wait until index is loaded
  if (!idx) return;

  // Remove current search results
  searchResults.innerHTML = "";

  selectScreen(screen.rswheel);

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

        const template = document.getElementById("template-search-card");

        if (subjectExams.length > 0) {
          // Add the exam card buttons for each exam there are for that subject
          var elements = [];
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

            var card = template.cloneNode(true).content;
            var headings = card.querySelectorAll("h2");
            headings[0].textContent = examNumber;
            headings[1].textContent = examLevel;

            card.querySelector(".standard-info-time-period").textContent = `${startYear}~${endYear}`;
            card.querySelector(".standard-info-description").textContent = `${examTitle} | Credits: ${creditsText}`;

            card.querySelector("a").setAttribute("href", `https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/${examNumberURL}.zip`);

            elements.push(card);
          });

          for (var i = 0; i < elements.length; i++) {
            searchResults.append(elements[i]);
          }
          resolve();
        }
        else if (subjectExams.length === 0) {
          // If there are no exams for that subject, show the error screen (why face emoji)
          selectScreen(screen.snfound);
        }

      }, 0);
      /*
      We added a 0 millisecond delay because of a behaviour in JavaScript
      Seems like "tasks" in JavaScript will be blocking, until a certain task is done JavaScript
      will move onto the next task. Thus, adding a 0 millisecond delay to this will allow the loading
      wheel to show
      */
    }
  ).then(
    () => {
      // Once exams are found show the search results
      selectScreen(screen.results);
    }
  );
}

let previous_search = "";

function handleAutocomplete(e) {
  if (event.keyCode != 9 && event.keyCode != 13 || autocomplete.textContent == default_searchtext) {
    // Keycode 8 is backspace;
    // We do this incase of an error; the search is empty but the user uses it to "go to home".
    if(event.keyCode == 8 && searchText.value == "") {
      selectScreen(screen.welcome);
      setAutoCompleteText();
    }

    return;
  }
  searchText.value = autocomplete.textContent;
  if (previous_search != searchText.value || !isShowing(screen.results)) {
    showSearchResults();
    previous_search = searchText.value;
  }
  else {
    // If the current input text is not equal to autoComplete's text, will auto complete
    searchText.value = autocomplete.textContent;
  }
}
// #endregion

// #region Search Function
// Searching for subject exams from clicking the subject buttons
function search(term){
  autocomplete.textContent = term;
  searchText.value = term;
  //keep search state in sync
  previous_search = term;
  previous_search_length = term.length;

  showSearchResults();
}
// #endregion

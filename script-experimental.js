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
    b: parseInt(hex.substring(5, 7), 16)
  };
}

// Helper function to convert RGB values to a hex color
function rgbToHex(r, g, b ) {
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
    b: interpolateValue(rgb1.b, rgb2.b)
  };

  return rgbToHex(
    interpolateValue(rgb1.r, rgb2.r),
    interpolateValue(rgb1.g, rgb2.g),
    interpolateValue(rgb1.b, rgb2.b)
  );
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
var searchText;
var autocomplete;
runOnDocumentLoad(function() {
  searchResults = document.getElementById('search-results');
  subjectSelect = document.getElementById('subject-select');
  searchText = document.getElementById('search-text');
  autocomplete = document.getElementById('autocomplete');
});

runOnWindowLoad(function () {
  document.getElementById("fg").style.display = "flex";
  searchText.focus();

  searchResults.addEventListener('scroll', function(e) {
    var scrollamount = searchResults.scrollTop / searchResults.scrollHeight;
    // `scrollamount ? scrollamount : 0` --> If `scrollamount` is `NaN`, we just return the beginning value (0).
    searchResults.style.setProperty("--scroll-amount", interpolate("#4287f5","#460c85", scrollamount ? scrollamount : 0));
  }, { passive: true });
  //searchResults.style.setProperty("--scroll-amount", "#4287f5", 0);
});
// #endregion

// #region Search Prep
// Searching
let idx;

let fullData;

let subjectList = [];

fetch("./subjects.json").then((res) => res.json()).then((data)=>{
  subjectList = data;

  var template = document.getElementById("template-subject-selector");
  for (let index = 0; index < subjectList.length; index++) {
    const subject = subjectList[index];
    if (subject == "Earth and Space Science") { continue; }
    var button = template.cloneNode(true).content;
    button.querySelector("button").onclick = function() { search(subject); };
    button.querySelector("p").textContent = subject;
    subjectSelect.appendChild(button);
  }
});

fetch("./searchIndex.json").then((res) => res.json()).then((data) => {
  // Hopefully, by offsetting this, we avoid "lunr is not defined" but we also
  // get the benefits of fetching literally as soon as the line of code is
  // run.
  runOnWindowLoad(function() {
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

const minCredits = 0
const defaultAutocompleteText = "Enter standard number or subject name";
let previous_search = "";

function setAutoCompleteText() {
  // Use textContent instead of innerHTML for user-supplied text.
  const text = searchText.value;

  if (text.length == 0) {
    // Set a safe default text message
    autocomplete.textContent = defaultAutocompleteText;

    selectScreen(screen.welcome);
    previous_search = "";
    return;
  }

  let matches = [];
  let shortestMatch;

  for (let i = 0; i < subjectList.length; i++) {
    const subject = subjectList[i];

    if (subject.toLowerCase().substr(0, text.length) == text.toLowerCase()) {
      if (!shortestMatch || subject.length < shortestMatch.length) {
        shortestMatch = subject;
      }

      matches.push(subject);
    }
  }

  matches.push(text);
  autocomplete_item = shortestMatch ? shortestMatch : text;
  autocomplete_item = text + autocomplete_item.substr(text.length, autocomplete_item.length);
  autocomplete.textContent = autocomplete_item;
}

function addFilter(filter) {
  // Strings are truthy/falsy; returns true if string has no content, is null, etc..
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

// TODO: Investigate performance of loading results on pageload, then making
// them visible or invisible depending on if they meet the search criteria.
function showSearchResults() {
  selectScreen(screen.rswheel);
  // Remove current search results
  searchResults.innerHTML = "";

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

        // If there are no exams for that subject, show the error screen (why face emoji)
        if (subjectExams.length < 1) {
          selectScreen(screen.snfound);
          return;
        }
        var template = document.getElementById("template-search-card");
        var cards = [];
        // Add the exam card buttons for each exam there are for that subject
        console.log(fullData);
        subjectExams.forEach((result) => {

          //const examNumber = fullData[result.ref]["number"];
          const startYear = fullData[result.ref]["start-year"];
          const endYear = fullData[result.ref]["end-year"];
          //const examTitle = fullData[result.ref]["title"];
          const creditsText = fullData[result.ref]["credits"];
          // const examLevel = fullData[result.ref]["level"];

          // We *do*, however, need to make sure the URL works like we want it to.
          // Which is why, for URL parts, we use encodeURIComponent.
          const examNumberURL = encodeURIComponent(fullData[result.ref]["number"]);

          var card = template.cloneNode(true).content;
          card.querySelector("h2").textContent = fullData[result.ref]["number"];
          card.querySelector("p").textContent = fullData[result.ref]["title"];

          card.querySelector(".standard-level").textContent = fullData[result.ref]["level"];
          card.querySelector(".standard-years").textContent = startYear + "~" + endYear;
          if (creditsText === "-") card.querySelector(".standard-credits").textContent = "Scholarship";
          else card.querySelector(".standard-credits").textContent = `${creditsText} Credits`;

          card.querySelector("a").setAttribute("href", `https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/${examNumberURL}.zip`);
          cards.push(card);
        });

        for (var i = 0; i < cards.length; i++) {
          searchResults.appendChild(cards[i]);
        }

        resolve();
      }, 0);
      /*
      We added a 0 millisecond delay because of a behaviour in JavaScript
      Seems like "tasks" in JavaScript will be blocking, until a certain task is done,
      JavaScript will move onto the next task. Thus, adding a 0 millisecond delay to this will allow the loading
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

//Stupid tab button, it has to be done on the keydown event because when keyup, the focus will have been shifted
runOnDocumentLoad(function() {
  searchText.addEventListener('keydown', (event) => {
    /*
    Why we use autocomplete.textContent instead of innerHTML:
    This is because Earth & Space Science has an ampersand, which is displayed
    as &amp; in HTML. If we use autocomplete.innerHTML, then we are comparing
    searchText.value (which is plain) text, with HTML markup. This leads to
    errors such as when autocompleting for Earth & Space Science, the
    searchText will be displayed as "Earth &amp; Space Science".
    */

    // Keycode 9 is the tab key
    // Keycode 13 is the enter key
    if (event.keyCode != 9 && event.keyCode != 13 || autocomplete.textContent == defaultAutocompleteText) {
      // Keycode 8 is backspace;
      // We do this incase of an error; the search is empty but the user uses it to "go to home".
      if(event.keyCode == 8 && searchText.value == "") {
        selectScreen(screen.welcome);
        setAutoCompleteText();
      }

      return;
    }
    searchText.value = autocomplete.textContent;
    if (previous_search != searchText.value) {
      showSearchResults();
      previous_search = searchText.value;
      return;
    }
    // If the current input text is not equal to autoComplete's text, will
    // auto complete.
    searchText.value = autocomplete.textContent;
  });

  searchText.addEventListener('input', (event) => {
    setAutoCompleteText();
  }, { passive: true });
});

// Searching for subject exams from clicking the subject buttons
function search(term){
  autocomplete.textContent = term;
  searchText.value = term;

  showSearchResults();
}
// #endregion

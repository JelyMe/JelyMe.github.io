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
let relevant_subject_list = [];

fetch("./subjects.json")
  .then((res) => res.json())
  .then((data)=>{
    subjectList = data;
    relevant_subject_list = data;

    var template = document.getElementById("template-subject-selector");
    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];
      var button = template.cloneNode(true).content;
      button.querySelector("button").onclick = function() { search(subject); };
      button.childNodes[0].textContent = subject;
      //button.querySelector("h1").textContent = subject;
      subjectSelect.appendChild(button);
    }
  });
fetch("./searchIndex.json")
  .then((res) => res.json())
  .then((data) => {  
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
// This is everything everywhere all at once made into code.
// It's going to take a while to fix, even every time I add to it,
// I end up just monkeypatching instead.

// Texts in input field
//const searchText = document.querySelector("#search-text");
// Use textContent when simply displaying text to avoid HTML injection.
//const autocomplete = document.querySelector("#autocomplete");
const minCredits = 0
const default_searchtext = "Enter standard number or subject name";
let previous_search_length = 0;

// 37 lines of gross...
function setAutoCompleteText() {
  // Use textContent instead of innerHTML for user-supplied text.
  const text = searchText.value;

  if (text.length < previous_search_length || text.length < 2) {
    relevant_subject_list = subjectList;
  }
  console.log(relevant_subject_list);
  
  if (text.length == 0) {
    // Set a safe default text message
    autocomplete.textContent = default_searchtext;

    // This would never be visible without refreshing the page otherwise!!
    selectScreen(screen.welcome);
    previous_search = "";
    previous_search_length = 0;
    return;
  }

  let delete_list = [];
  let matches_list = [];

  for (let i = 0; i < relevant_subject_list.length; i++) {
    const subject = relevant_subject_list[i];
    if (subject.toLowerCase().substr(0, text.length) == text.toLowerCase()) {
      matches_list.push(subject);
    }
    else delete_list.push(subject);
  }
  relevant_subject_list = matches_list;

  matches_list.push(text);
  autocomplete_item = matches_list[0];
  autocomplete.textContent = autocomplete_item;
  // How TF did we even introduce a need for this ".replace", anyway?
  // .textContent should make this completely irrelevant.
  searchText.value = autocomplete_item.substr(0, text.length).replace("&amp;", "&");
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
      // To anyone testing on Firefox: setTimeout just breaks after a while.
      // IDFK why, but it does. You simply have to create a new tab altogether.
      // Please refrain from changing this timeout of going on a code rampage in
      // order to find the source of this bug. It's not fun.
      // Trust me, even when looking at 3am, you won't realise what's going on
      // until you try it in another browser and it works fine.
      // Don't make my mistake. The setTimeout is fine. Open a new tab and close
      // the old one.
      //
      // Curious why there's a setTimeout to begin with? See below the promise,
      // about 64 lines down.
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
	  // No sanitization needed; textContent literally just changes the text, no HTML parsing involved. It's like it sanitizes for us!
	  // TBF these *could* probably be inlined.
	  // It saves a few LoC => shorter load speed,
	  // but isn't too necessary (and is a *little* unergonomic).
	  //const examNumber = fullData[result.ref]["number"]; // Inline
	  const startYear = fullData[result.ref]["start-year"]; // Not inline
	  const endYear = fullData[result.ref]["end-year"]; // Not inline
	  //const examTitle = fullData[result.ref]["title"]; // Inline
	  const creditsText = fullData[result.ref]["credits"]; // Not inline
	  const examLevel = fullData[result.ref]["level"]; // Not inline

	  // We *do*, however, need to make sure the URL works like we want it so.
	  // Wcich is why, for URL parts, we use encodeURIComponent.
	  const examNumberURL = encodeURIComponent(fullData[result.ref]["number"]);

	  var card = template.cloneNode(true).content;
	  var headings = card.querySelectorAll("h2");
	  var details = card.querySelectorAll("b");
	  headings[0].textContent = fullData[result.ref]["number"];
	  // "- Credits" is not very nice to see.
	  if (creditsText === "-") details[0].textContent = "Scholarship";
	  else details[0].textContent = `${creditsText} Credits`;
	  details[1].textContent = `${startYear}~${endYear}`;
	  card.querySelector("p").textContent = fullData[result.ref]["title"];

	  //if (examLevel !== "S") headings[1].textContent = examLevel;
	  headings[1].textContent = examLevel;
	  card.querySelector("a").setAttribute("href", `https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/${examNumberURL}.zip`);
	  cards.push(card);
	  //searchResults.appendChild(card);
	});

	for (var i = 0; i < cards.length; i++) {
	  searchResults.appendChild(cards[i]);
	}

	resolve();
      }, 0);
      /* 
      We added a 5 millisecond delay because of a behaviour in JavaScript
      Seems like "tasks" in JavaScript will be blocking, until a certain task is done,
      JavaScript will move onto the next task. Thus, adding a 5 millisecond delay to this will allow the loading
      wheel to show
      */
      /* To explain: in JavaScript - which, note, is a single-threaded language
       * by default - setTimeout adds the function to a queue that isn't bound
       * to the function it was called in - this allows us to get funky with it
       * because it's no longer part of the rest of the code - and thus, it does
       * not block, because it leaves the blocking function through setTimeout.
       *
       * I also changed this delay to 0, because 5ms is still 5ms more than we
       * need.
       */
    }
  ).then(
    () => {
      // It's also fine to do `selectScreen(searchResults);` but it's a bit less
      // decoupled and gives the suggestion that screen select is tied to searching,
      // somehow.

      // Once exams are found show the search results
      selectScreen(screen.results);
    }
  );
}

const tabKeyCode = 9;
const enterKeyCode = 13;
let previous_search = "";

//Stupid tab button, it has to be done on the keydown event because when keyup, the focus will have been shifted
// WTF dude tab button isn't stupid, it's stunning.
// Thanks to the tab button I don't need to use my mouse on this site anymore
// (big win)!
runOnWindowLoad(function() {
  searchText.addEventListener('keydown', (event) => {
    /*
    Why we use autocomplete.textContent instead of innerHTML:
    This is because Earth & Space Science has an ampersand, which is displayed
    as &amp; in HTML. If we use autocomplete.innerHTML, then we are comparing
    searchText.value (which is plain) text, with HTML markup. This leads to
    errors such as when autocompleting for Earth & Space Science, the 
    searchText will be displayed as "Earth &amp; Space Science".

    > Unfun fact! 
    > This even happens in Steam, somehow. Ever listened to "Giant&apos;s Deep"
    > by Andrew Prahlow? To avoid this we have to use the raw plain text of
    > autocomplete. Hence, we use textContent.
    */
    // Also, imo, `.textContent` is literally just goated.
    // Did I mention it basically auto-eradicates our XSS problems for us?
    // Awesome!!!

    // Keycode 9 is the tab key
    // Keycode 13 is the enter key
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
    if (previous_search != searchText.value) {
      showSearchResults();
      previous_search = searchText.value;
      return;
    }
    // If the current input text is not equal to autoComplete's text, will 
    // auto complete.
    searchText.value = autocomplete.textContent;

    // I have a rather lengthy argument, as to why the following code is 
    // commented, but in short: we don't need it. Users like me are unable to use 
    // the site **PROPERLY** otherwise.
    //event.preventDefault();
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

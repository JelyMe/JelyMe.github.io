"use strict";

/* #region URL Searching 
 * So, basically, this allows for passing values into the URL as query
 * parameters. E.g https://ourexams.org/?q=Business+Studies` will automatically
 * load and show the search results for "English". */
var search_parameters = {};

// Use this URL to test: http://127.0.0.1:8000/index-experimental.html?q=lol&mincredits=3

runOnDocumentLoad(function() {
  var url_params = {};
  var parameter_list = window.location.search.slice(1).split("&");
  var filtered_params = [];
  for (var i = 0; i < parameter_list.length; i++) {
    var param = parameter_list[i].split("=");
    if (param.length !== 2) continue;
    try {
    }
    catch {
    }
    if (decodeURIComponent(param[i]) !== param[i]) continue;
    parameter_list[i] = parameter_list[i].split("=");
    
  }
  if (parameter_list == []) return;
  console.log(parameter_list);
});
/* #endregion */

// #region Filters

// General idea:
// > User selects filters
// > They begin typing
// > The search is filtered,
// > The filtered search is used for autocomplete.

var NUMBER = 0;
var STRING = "";
var URLSTRING = "";
var SUBJECT;

var general_form = {
  id: NUMBER,
  start_year: NUMBER,
  end_year: NUMBER,
  year: { start: NUMBER, end: NUMBER },
  title: STRING,
  subject: SUBJECT,
  level: NUMBER,
  url: URLSTRING
};

var _general_form = {
  number: 0, // NUMBER
  startyear: 0, // NUMBER
  endyear: 0, // NUMBER
  title: "Read written texts to understand ideas and information",
  credits: 5, // NUMBER
  subject: "Credits",
  level: "All",
  id: 0 // NUMBER
};

// This does nothing, IDEK why it's here, but I suppose it acts as a good
// example?
// It certainly is clear about how to input/output with filters.
function noFilter(array) {
  return array;
}

function subjectFilter(array, filter_arguments) {
  var subject = filter_parameters.subject.toLowerCase();
  var new_array = [];
  for (var i; i < array.length; i++) {
    var item = array[i];
    if (fuzzyMatches(subject, item.subject.toLowerCase())) {
      new_array.push(item);
    }
  }
  return new_array;
}

function clampCreditsFilter(array) {
  // TODO
}

//function filter_results(filtering_functions, array) {
//  var output_array = array;
//  for (var i = 0; i < filtering_functions.length; i++) {
//    output_array = filtering_functions[i](array);
//  }
//  return output_array;
//}

// #endregion

// #region FuzzyFind
// So, the plan is to, we fuzzyfind on each paper's *subject* because "digitech"
// obviously refers to "**digi**tal **tech**nology"
// (technically "**digit**al t**ech**nology").
// We do not, however, want to fuzzyfind anything else, because "art" is
// probably not referring to "**A**pply business knowledge to an
// ope**r**a**t**ional problem(s) in a given small business context".

// https://stackoverflow.com/questions/1349404/generate-a-string-of-random-characters
function makeid(length) {
    let result = '';
    //const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characters = ' ABC DEF GHI JKL MNO PQR STU VWX YZa bcd efg hij klm nop qrs tuv wxy z01 234 567 89';
    //const characters = '\u0101';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function testSearch(match_text = makeid(5)) {
  var search_testing = [];
  for (var i = 0; i < 100; i++) {
    search_testing.push(makeid(50));
  }
  console.log(search_testing);
  var matches = fuzzyFind(match_text, search_testing);
  console.log(match_text);
  console.log(matches);
}

function normalizeSearch(text) {
  return text.replace(" ","").replace("\u0101", "a").toLowerCase();
}

function fuzzyMatches(search_text, text_to_search) {
  var chars = Array.from(normalizeSearch(search_text));
  var text = normalizeSearch(text_to_search);
  var indices = [];
  while (chars.length > 0) {
    var character = chars.shift().toLowerCase();
    var index = text.indexOf(character);
    if (index == -1) {
      return false;
    }
    indices.push(index);
    text = text.slice(index + 1);
  }
  return indices;
}

function fuzzyFindFilter(array) {
  var matches = [];
  var lowercase_text = filter_params.search.toLowerCase();
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (fuzzyMatches(lowercase_text, filter_params.stringify(item))) {
      matches.push(item);
    }
  }
  return matches;
}

function fuzzyFind(search_text, array, stringify = function(str){return str;}, filters = []) {
  var filtered_array = array;
  for (var i = array.length - 1; i >= 0; i--) {
    filtered_array = (filters[i])(filtered_array);
  }
  var matches = [];
  var lowercase_text = search_text;
  for (var i = 0; i < filtered_array.length; i++) {
    var array_item = filtered_array[i];
    var indices = fuzzyMatches(lowercase_text, stringify(array_item));
    if (indices) {
      matches.push(array_item);
      matches.push(indices);
    }
  }
  return matches;
}

// #endregion

// #region Search

var subjects = []; // Full, immutable array.
var subjects_trim = []; // Shorter array; shorter iteration
var previous_searchtext = "";

//function autocomplete(search_text, credits, level) {
//  if (search_text.length < previous_searchtext.length) {
//    subjects_trim = subjects;
//  }
//}

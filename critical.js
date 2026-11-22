"use strict";

// This is a little bit to take in, at least when other stuff is more
// important;
// This defines two functions, `runOnDocumentLoad` and
// `runOnWindowLoad`.
// Each of them will run only ONCE and will only run just before the
// `document.onload` and `window.onload` events respectively.
// `runOnDocumentLoad` guarantees all of the HTML exists and is ready.
// `runOnWindowLoad` guarantees most things, e.g CSS, have loaded.
var document_load_functions = [];
var window_load_functions = [];
var after_document_load_functions = [];
var after_window_load_functions = [];
var ready_state_value = 1; // 1 for loading

function readyStateChangeListener() {
  ready_state_value++;

  if (ready_state_value >= 2) {
    while (document_load_functions.length > 0) {
      (document_load_functions.pop())();
    }
    while (after_document_load_functions.length > 0) {
      (after_document_load_functions.pop())();
    }
  }
  if (ready_state_value === 3) {
    while (window_load_functions.length > 0) {
      (window_load_functions.pop())();
    }
    while (after_window_load_functions.length > 0) {
      (after_window_load_functions.pop())();
    }
    document.removeEventListener('readystatechange', readyStateChangeListener);
  }
}
document.addEventListener('readystatechange', readyStateChangeListener);

function runOnDocumentLoad(func) {
  if (ready_state_value >= 2) func();
  else document_load_functions.push(func);
}
function runOnWindowLoad(func) {
  if (ready_state_value >= 3) func();
  else window_load_functions.push(func);
}

runOnWindowLoad(function() { selectScreen(screen.welcome) });

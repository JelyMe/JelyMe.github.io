# Conventions Used Within This Codebase

1. For all languages that is not HTML and CSS, use camelCase for all names, including variables and functions. For HTML and CSS, classes and IDs must be named where each word is separated by a dash, and all the letters have to be lowercase.

2. Make sure that the CSS styling is grouped by attribute to avoid clustered CSS code! For example, all the code that has to do with fonts are grouped together in a class, and all the border stuff is grouped together, and so on! 

3. Every object needs to be somewhat modular so that we can copy paste without problems.

4. ~~all backend must be spaghetti~~ It's about the front end user experience, if it doesn't feel nice, fix it.

5. Curly braces shall start on the same line as the expression. Eg:
```js
if (expression) {
   //Stuff
}
```

6. Don't delete other's stuff without asking what it was used for. However, if you think that other's code can be written more cleanly, please make sure that you know exactly what their code is doing (along with potentially little things) before refactoring.

7. ~~**COMMENT EVERYTHING**~~ Please do not over document code. Document when something needs to be explained explicitly. An example can be found in `script.js`.
>   Why we use `autocomplete.textContent` instead of `innerHTML`: This is because Earth & Space Science has an ampersand, which is displayed as `&amp;` in HTML. If we use `autocomplete.innerHTML`, then we are comparing `searchText.value` (which is plain) text, with HTML markup. This leads to errors such as when autocompleting for Earth & Space Science, the `searchText` will be displayed as `"Earth &amp; Space Science"`. To avoid this we have to use the raw plain text of autocomplete. Hence, we use `textContent`.

8. All of these rules apply in retrospect, with a grace period. The refactoring should be done before you push to this repo.

### HAVE FUN

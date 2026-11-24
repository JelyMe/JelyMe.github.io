# Contributing

Please **only commit to the `dev-branch`**!
Commits to the `main` branch are immediately rejected.

No build tools are required, though a local server is recommended for ease of
development. `python -m http.server` will do!

## Code Conventions

1. Use camelCase for all names in JavaScript.

2. Use lower-kebab-case for HTML and CSS.

3. Group all CSS code by attribute. For example, all code related to borders is in one section, fonts in another.

4. Make sure code is modular, so it can be copy-pasted easily.

5. The main priority is the user experience.
   As long as your code isn't *hindering* others, and it's fixable, then you
   should be fine.

6. Curly braces begin on the line of the expression and end on a newline.
   ```js
   if (someVar === anotherVar) {
     doSomethingAboutIt();
   }
   ```

7. Don't change code without permission of the owner or understanding of what it does.

8. Comment your code where it isn't self-explanatory.

9. Refactoring should be complete before you push to the repo.

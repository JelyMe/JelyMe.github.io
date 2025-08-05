Please **only commit to the `dev-branch`**!
Any and all commits to the `main` branch are immediately rejected.

The main priority of this code is the user experience.
It's okay for the code to be a *little* messy if the visuals are OK.
Don't like it? Fix it! Otherwise, leave it as-is, and we needn't worry.

No build tools are required at all.
Me personally (FoxChillz), I use ~~Windows Notepad~~ NeoVim with almost no plugins!

# Code Conventions

These should be adhered but obviously will not affect your code's result.
Note that your code *will* be significantly renamed to fix these,
so if you do not follow these conventions,
don't expect your code to last long.

Reminder these are not *strictly* mandatory but they are
**highly recommended**.

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

7. Don't change code without permission of the person who wrote it.

8. Comment your code where it isn't self-explanatory.

9. Refactoring should be complete before you push to the repo.

# Notes PLEASE READ THESE

This section should be deleted after reading, it's purely my form of
communication about this.

3. This is a nightmare that's ~~already happened~~ waiting to happen. Please, can we just make it grouped into the places it impacts?

4. Do you mean decoupled???

6. This shouldn't go in the rules. If it causes any issues, *then* it can. Before that, it's just annoying.

7. Well, shit. I just spent months refactoring silently to see this.
   I get why this is there - can we perhaps add some additional rules in?
   It's a very fair point if expanded properly.

8. Could we also include "try to name things so well that you don't need to comment them in the first place"?

9. "All of these rules apply in retrospect, with a grace period." Why does it need to apply to previous commits? We literally can't fix them.
    Can we have another branch for unfinished commits? Feedback in-dev is useful.

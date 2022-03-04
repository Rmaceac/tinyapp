# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["The main URLs display page. This shows a list of all the user's added URLs with options to View/Edit and Delete. The user's email address is displayed in the header when logged in."](https://github.com/Rmaceac/tinyapp/blob/master/docs/urls_page.png?raw=true)

!["The View/Edit page for an individual URL. Clickable short URL is hyperlinked, and there is a form to change the short URL's associated long URL."](https://github.com/Rmaceac/tinyapp/blob/master/docs/viewedit_page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- morgan

Dev dependencies include :

- mocha
- chai
- nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Known Issues
Be aware when perusing or testing the app, the following error could occur when running your own server. If you:
1. Register a new user and they are logged in.
2. Refresh the server and then refresh the browser.
3. An error will occur as the cookies for the session are still set (since the user didn't log out properly), but since the server reset also, there is no longer a record of the new user in the database (because we aren't using a REAL database). In that case the cookies need to be cleared manually, but everything works as per normal there.

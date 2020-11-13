# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Basic analytics are provided on the Edit page for each short URL:
* Total clicks: simple counter of the number of times the short URL has been clicked
* Unique visits: each short URL click sets a cookie, so this counter measures unique **sessions**
* Visitor list: random ID and timestamp of each click

## Final Product

!["Screenshot: TinyApp landing page"](https://raw.githubusercontent.com/mradamt/tinyapp/master/docs/Screen%20Shot%202020-11-12%20at%204.42.55%20PM.png)
!["Screenshot: My URLs, listing user's shortened URLs"](https://raw.githubusercontent.com/mradamt/tinyapp/master/docs/Screen%20Shot%202020-11-12%20at%204.40.51%20PM.png)
!["Screenshot: Create new TinyURL"](https://raw.githubusercontent.com/mradamt/tinyapp/master/docs/Screen%20Shot%202020-11-12%20at%204.43.37%20PM.png)
!["Screenshot: Edit previously created TinyURL"](https://github.com/mradamt/tinyapp/blob/master/docs/Screen%20Shot%202020-11-12%20at%209.01.01%20PM.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
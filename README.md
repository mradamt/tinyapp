# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Basic analytics are provided on the Edit page for each short URL:
* Total clicks: simple counter of the number of times the short URL has been clicked
* Unique visits: each short URL click sets a cookie, so this counter measures unique **sessions**
* Visitor list: random ID and timestamp of each click

## Final Product

!["Screenshot: TinyApp landing page"](https://github.com/mradamt/tinyapp/blob/master/docs/landing-page.png)
!["Screenshot: My URLs, listing user's shortened URLs"](https://github.com/mradamt/tinyapp/blob/master/docs/urls_page.png)
!["Screenshot: Create new TinyURL"](https://github.com/mradamt/tinyapp/blob/master/docs/create-new-tinyurl.png)
!["Screenshot: Edit TinyURL and view analytics"](https://github.com/mradamt/tinyapp/blob/master/docs/edit-analytics-url.png)

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
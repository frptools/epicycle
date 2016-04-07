**Epicycle** :: node.js + Motorcycle.js == Isomorphism
==================================================

Epicycle is a foundational/boilerplate project for building reactive, isomorphic applications with [Motorcycle.js](https://github.com/motorcyclejs/core) and [node.js](https://nodejs.org/en/).

_NOTE: This project is a work in progress. I've been dogfooding it for a small SaaS application I've been building and in the process have improved and refactored a large quantity of the existing code. The foundational stuff showing separation between server and client code should be fine for ideas, but a commit in the near future will overhaul a lot of what you see here. I'd suggest starring the repository and waiting until the next commit, if you're interested in using this for your own work._

## Introduction

Starting a new web application these days is annoyingly overburdened with setup and ceremony, not to mention all of the repetitive groundwork required to establish a solid foundation for the rest of the application to be built upon. Depending on what you're trying to do, it can take anywhere from hours to days to get to a point where you're writing your actual project-specific code. This project is designed to take that pain out of the equation and give you the fastest possible starting point when developing a new isomorphic web application using [Motorcycle.js](https://github.com/motorcyclejs/core).

#### Why Motorcycle?

Simply put, it's ridiculously fast, while being idiomatically the same as [Cycle.js](http://cycle.js.org/). So if you know Cycle, you should be able to get into Motorcycle pretty easily. The underlying streams library is [Most](https://github.com/cujojs/most), which is a little different in behaviour to to RxJs, but it's literally two orders of magnitude faster, so the small learning curve is worth it.

#### Build Tools

It is impossible to be unopinionated when it comes to build tools, because there are many of them and each has its pros and cons. The project uses [gulp](http://gulpjs.com/), [Browserify](http://browserify.org/), [BrowserSync](http://www.browsersync.io/), [Babel](http://babeljs.io/), [eslint](http://eslint.org/) and [mocha](https://mochajs.org/) for testing. It also comes bundled with basic [Stylus](https://github.com/stylus/stylus) support by default, but it's very easy to swap out if you prefer something such as Sass, Less or inline JavaScript-based styles. Obviously, for the purposes of isomorphism, you'll need to run node.js on your production server, though you may wish to bulletproof it with a process manager [such as this one](http://strong-pm.io/).

Remember, Epicycle is more boilerplate than it is framework. You should change as much of it as you like to suit your personal development preferences. It does come with a base library of helpers to facilitate the differences between "widget" components and "page" components, particularly with respect to concerns such as HTTP status codes, document titles, etc., which you'll spend a lot of time implementing support for if you try to do it yourself. If you're ok with the chosen defaults though, you should be able to hit the ground running and start building your application straight away.

- [Introduction](#introduction)
- [Features](#features)
- [What's an isomorphic web application?](#whats-an-isomorphic-web-application)
- [Setup & Installation](#setup--installation)
- [Unit Tests](#unit-tests)
- [Usage and Best Practices](#usage-and-best-practices)
- [The State Driver, Component Helpers and Routing](#the-state-driver-component-helpers-and-routing)
- [Roadmap](#roadmap)

## Features

- Complete isomorphic foundation for bootstrapping Motorcycle-based client applications
- Designed to be easy to break apart later for scalability
- Clean shared component references allowing for later extraction to separate npm packages
- One-stop-shop build process for development, testing and deployment builds
- Router integration and page-specific metadata for enabling correct HTTP status codes

## What's an isomorphic web application?

In this day and age, with so many advanced JavaScript-based front-end frameworks to choose from, it's natural to want to build our user interface so that it runs entirely on the client, and make subsequent requests for data to a clean server-side API. True separation of concerns! Several problems emerge though:

1. **The time it takes to render the initial view can be quite noticeable**, as the full JavaScript must first be downloaded before it can run, and then a second round trip may be required back the server to retrieve the initial data that is needed. This impacts the user experience to a varying degree depending on the user's latency and bandwidth.
2. **It's not great for search engine indexability and rankings**. Google is reportedly able to crawl sites that run JavaScript, but they're also known to optimize results with initial rendering speed in mind, so a slow-to-start site is going to suffer in search rankings.
3. **Proper URIs with different paths are harder to make use of**. Path-based URIs for each route often end up being avoided in favour of hash-based URIs. This happens because if we change the URI path based on client application state and then try to reload the page later at that same URI, either we'll get a 404 response because it's not the page we set up to bootstrap the application, or the server won't easily be able to determine if that URI is valid, thus necessitating a blanket 200 response for every request, which can have unintended side effects when the route was actually invalid.

An isomorphic app solves all of these problems. For any initial request, it runs the client application server-side and captures the output. It then offers up a rendering of the initial state of the DOM, along with an appropriate HTTP status code depending on the validity of that request. In this way, the user sees content almost immediately (even if it takes a little longer for client-side functionality to boot up), search engines will likely do a better job of indexing the page and favouring it due to a fast response time, and the user can bookmark, link and share any URI that matches a valid route for the application. As a bonus, it also becomes possible to make forms and links work even if the app didn't load correctly in the client's browser, for whatever reason.

## Setup & Installation

Clone the repository or [download a zip of the source code](https://github.com/axefrog/epicycle/archive/master.zip) and extract it to your development directory, then run:

```text
npm install
```

Make sure you have gulp installed globally too, as you'll need it to build the project from the command line.

```text
npm install -g gulp
```

> **Note**: If you're using the [Atom](http://atom.io/) editor with [Atom Linter](https://atom.io/packages/linter), you'll also want to install the [eslint plugin](https://github.com/AtomLinter/linter-eslint) and make sure _"Use global ESLINT installation"_ is checked. Not doing so can cause the linter to trip up. If you do, make sure [eslint](https://www.npmjs.com/package/eslint) and [babel-eslint](https://www.npmjs.com/package/babel-eslint) are both installed globally as well:
> ```
> npm install -g eslint babel-eslint
> ```
> Note also that the project .eslintrc file is preconfigured to use babel-eslint.

Finally, to build and run the application:

```text
gulp
```

The build process will start a local node.js dev server and a BrowserSync process, proxied to the dev server, and start watching your source files for changes.

To view the application, open [http://localhost:3000](http://localhost:3000) in your browser. If you're already running BrowserSync for another project, the port may be different, so pay attention to the gulp console output for the actual port number.

**For a production build:**

```text
gulp build:dist
```

Client bundles are compressed and minified for production builds only, as the refresh time is otherwise too slow when making many changes during development. Unit tests are also run when building for production in order to ensure that the build fails if any tests fail.

## Unit Tests

Mocha and Chai are integrated by default. As always, replacing them should be easy enough if you prefer to use something else. Your tests can be placed within the _src_ directory, as long as they exist at some depth within a _tests_ folder (you can have many _tests_ folders) or a file named _tests.js_ (again, as many of these as you like). In this way, you can have your unit tests bundled with each component, which makes it easy to keep related files together.

Tests are disabled by default for the main gulp watch task in order to reduce rebuild/reload times during development, but if you're writing tests, you should run the test watcher, which quickly rebuilds and reruns tests when any changes are made. For the best of both worlds, run two terminals/shells/consoles; one for the test watcher and one for the default gulp development task.

**To start the test watcher:**

```text
gulp test:dev
```

## Usage and Best Practices

Because we're generally using the same code on both the server and client, it's easy to get confused and wonder how we're supposed to set up our Motorcycle drivers, given that operations such as data retrieval are thought about differently on the server than they are on the client. If we're trying to unify our code so that it works on both the client _and_ the server, what do we do?

While the isomorphic mantra tells us that the client and the server are effectively the same, in actual fact that's not quite the truth. **Our Motorcycle.js app is still fundamentally designed to be run on the client**. The fact that we're pre-rendering the initial view on the server is just a bonus we get from being able to run JavaScript on the server. **The initial server-side page renderer will simply pretend it's the client**. It'll make any necessary HTTP (or other) requests that it needs to, and the fact that those requests are being directed at the very server from which they originated is not something we need to worry about.

### Planning for increasing load and a growing code-base

As we grow our application and separate concerns, we start to realise that UI-specific requests, such as page rendering, are separate from non-UI-specific requests, such as data lookup and server state mutation. In the past, these will have all very commonly been handled by a single server-based application (think MVC and similar patterns). A presentation tier will have handled UI-specific requests and responded with new representations of the user interface (pure server-side rendering), and a business tier will have handled requests to retrieve data and mutate state. In our case, all we're doing is accounting for the fact that we've moved almost the entire presentation tier to the client and then had it bridge the gap to our business tier via standard HTTP requests (XMLHttpRequest/Fetch/WebSockets).

The bottom line is that our server-side rendering code will very likely end up making API calls via HTTP requests, even though the requests are being made to the same server it's running on, *and this is fine*. When we begin to scale our operations later and direct our pure API calls to a different server and/or (sub)domain, our client application code will thus be impacted minimally.

### Regarding secondary node_modules folders

You'll notice the use of node_modules folders *within the source*. This is optional of course, but consider the benefits. The standard path resolution algorithm for module loading is [described here](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) and due to the way it works, it gives us a very easy way to share common components within our application without hacking around with the way `require(...)` works (a dangerous game when we want to interoperate with external services, build tools and so forth). It also simplifies our process by avoiding the need to mess around with symlinks, which can be a pain, especially when dealing with multiple environments and operating systems.

**Do not confuse this use of node_modules with the external dependencies installed by npm**. In our *.gitignore* file, we ignore only the root node_modules folder, which is where npm will be putting external dependencies, and we allow node_modules folders elsewhere. In essence, just think of these descendant node_modules folders as shared components folders that can be easily and cleanly referenced within our application. This solves the nasty problem of parent path hell (`require("../../../../../../components/foo")`) and gives us a way to both share components that are area-specific, in addition to those that are used sitewide. Take a look at [Ryan Florence's folder layout article](https://gist.github.com/ryanflorence/daafb1e3cb8ad740b346), which was the inspiration for this decision. Note that, because we're using `node_modules` and not some build-tool-specific hackery of the `require` function, it means that at a later date it's trivial to separate common components and helpers into an external npm package in order to allow them to be shared among multiple projects.

## The State Driver, Component Helpers and Routing

A simple client-side application has few concerns other than the need to wire a few user interface components together. A large application however must be able to deal with URLs and the concept of "pages". These bring with them additional concerns, such as:

- Returning a correct HTTP status code on the first request
- Changing the document title when the URL is changed locally (pushed to history)
- Propagation of general page-related metadata that may be nested several layers deep
- Potential serialization of page information when an alternate content type is requested (content negotiation)

A new "state" driver has been created to help solve these issues. State is designed to emit snapshots of, obviously, the evolving state of the application as it reacts to changing inputs.

*TODO: The rest of this section. Look at the existing code in src/app for example usage. Look in src/node_modules/common for the implementations of the patterns used in this project.*

## Roadmap

### Functionality

- demonstrate nested titles
- tidy up example application structure (with neutral/minimalist styling)
- subnavigation example
- @cycle/isolate
- add cache busting to client.js href (hash the file contents)
- resolve multiple page emissions per route change (will need visualiser for this)
- consider content negotiation

### Build Process

- fix uglify processing: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md

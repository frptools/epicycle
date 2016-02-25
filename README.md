Isomorphic Boilerplate for Motorcycle.js
========================================

This boilerplate project is designed to give you the fastest possible starting point when developing a new isomorphic web application using [Motorcycle.js](https://github.com/motorcyclejs/core). It is impossible to be unopinionated when it comes to build tools, because there are many of them and each has its pros and cons. This project is optimised for reasonably speedy build times, and build dependencies have been chosen on this basis, as well as a desire for relative simplicity. Obviously, for the purposes of isomorphism, you'll need to run node.js on the server.

As a final note before we get started, remember- this is boilerplate. You should change as much of it as you like to suit your personal development preferences. If you're ok with the chosen tools though, you should be able to simply start building your application.

## Features

- Isomorphic rendering of Motorcycle-based client application
- Clear separation of server-side logic from presentation
- Clean segregation of components allowing later extraction to separate components and microservices
- One-stop-shop build process for development and testing
- Integrated routing and component-isolated style management

## Setup & Installation

Clone or extract this project to your development directory and run:

```text
npm install
```

To save time, all of the following should be present globally. If not, remove them as needed from gulpfile.js and package.json.

- **BrowserSync** gives us instant reloading when client assets change (JavaScript, etc.)
- **nodemon** runs our local node.js dev server and restarts it when files change.
- **eslint** is technically optional at the global level, but will give us in-editor linting.
- **gulp** is required in order to build the project.

```text
npm install -g browser-sync gulp eslint babel-eslint nodemon
```

If you're using [Atom Linter](https://atom.io/packages/linter), you'll also want to install the [eslint plugin](https://github.com/AtomLinter/linter-eslint) and make sure "Use global ESLINT installation" is checked. Not doing so can cause the linter to trip up. Make sure eslint and babel-eslint are both installed globally.

To build and run the application:

```text
gulp
```

This will start the node.js local dev server and a BrowserSync process, proxied to the dev server, and start watching your source files for changes.

## Usage and Best Practices

Because we're generally using the same code on both the server and client, it's easy to get confused and wonder how we're supposed to set up our Motorcycle drivers, given that operations such as data retrieval are thought about differently on the server than they are on the client. If we're trying to be unify our code, what do we do?

While the isomorphic mantra tells us that the client and the server are effectively the same, in actual fact that's not quite the truth. Our client-side app is still fundamentally designed to be run on the client. The fact that we're pre-rendering the initial view on the server is just a bonus we get from being able to run JavaScript on the server. The initial page rendering will simply pretend it's the client. It'll make any necessary HTTP (or other) requests that it needs to, and the fact that those requests are being directed at the very server from which they originated is not something we need to worry about.

As we grow our application and separate concerns, we start to realise that UI-specific requests, such as page rendering, are separate from non-UI-specific requests, such as data lookup and server state mutation. In the past, these will have all very commonly been handled by a single server-based application. A presentation tier will have handled UI-specific requests and responded with new representations of the user interface (pure server-side rendering), and a business tier will have handled requests to retrieve data and mutate state. In our case, all we're doing is accounting for the fact that we've moved almost the entire presentation tier to the client and bridged the gap to our business tier via network (HTTP) requests.

The bottom line is that our server-side rendering code will probably end up making internal API calls via HTTP requests, even though the requests are happening internally, *and this is fine*. When we begin to scale our operations later and direct our pure API calls to a different server and/or (sub)domain, our client application code will thus be impacted minimally.

### Regarding node_modules

You'll notice the use of node_modules folders *within the source*. This is optional of course, but consider the benefits. The standard path resolution algorithm for module loading is [described here](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) and due to the way it works, it gives us a very easy way to share common components within our application without hacking around with the way `require(...)` works (a dangerous game when we want to interoperate with external services, build tools and so forth). It also simplifies our process by avoiding the need to mess around with symlinks, which can be a pain, especially when dealing with multiple environments and operating systems.

**Do not confuse this use of node_modules with the external dependencies installed by npm**. In our *.gitignore* file, we ignore only the root node_modules folder, which is where npm will be putting external dependencies, and we allow node_modules folders elsewhere. In essence, just think of these descendant node_modules folders as shared components folders that can be easily and cleanly referenced within our application. This solves the nasty problem of parent path hell (`require("../../../../../../components/foo")`) and gives us a way to both share components that are area-specific, in addition to those that are used sitewide. Take a look at [Ryan Florence's folder layout article](https://gist.github.com/ryanflorence/daafb1e3cb8ad740b346), which was the inspiration for this decision. Note that, because we're using `node_modules` and not some build-tool-specific hackery of the `require` function, it means that at a later date it's trivial to separate common components and helpers into an external npm package in order to allow them to be shared among multiple projects.

## TODO

### Functionality

- router setup phase 2: (handle clicks)
- http error codes (301,302,404,403,500,etc.), also 401/403 vs 404 (handling secure information leakage)
- add eslint to gulp build process

### Build Process

- https://www.browsersync.io/docs/gulp/ (make browsersync a dev dependency, run natively inside gulp)
- https://www.npmjs.com/package/gulp-nodemon (as above, but for nodemon)
- only invoke browsersync reload after both server build and client build is complete
- improve code processing
  - fix ugly error message when babel compile fails
  - fix uglify processing: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
  - ... or switch to webpack? undecided on this.

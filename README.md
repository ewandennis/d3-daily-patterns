## Daily Patterns: A Simple Recurring Event Visualisation

This is a simple cyclic visualisation for recurring event visualisation.

### Sample Dataset

<img src="sample.png" width="350" alt="Daily Patterns Example">

This example shows my daughter's sleeping and feeding patterns over the first 6 months of her life.  Each revolution on the chart is a single 24-hour day, each black arc a sleep period and each red arc a feeding event.

You can view the contents of this repo live [here](http://ewandennis.github.io/d3-daily-patterns/).

### Installation

Prerequisites:
 - Bower
 - A browser

Clone this repo and install the Bower packages:

```bash
git clone https://github.com/ewandennis/d3-daily-patterns
cd d3-daily-patterns
bower install
```

Arrange for an HTTP server to access the visualisation (because CORS):

```bash
npm install node-static -g
static -p 8000
```

[Open http://localhost:8000/ in your browser.](http://localhost:8000/)

### Notes

The detail of each arc can be distracting when looking for broad visual patterns.  Try uncommenting the blur filter in `main.css` to uncover large scale detail.


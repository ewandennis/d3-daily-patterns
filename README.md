# Daily Patterns: A Simple Recurring Event Visualisation

![Daily Patterns Example](sample.png =500x410)

## Installation

Prerequisites:
 - Bower
 - A browser

Clone this repo and install the Bower packages:

```bash
git clone ...
cd ...
bower install
```

Arrange for an HTTP server to access the visualisation (because CORS):

```bash
static -p 8000
```

[Open http://localhost:8000/ in your browser.](http://localhost:8000/)

## Notes

The detail of each arc can be distracting when loking for broad visual patterns.  Try uncommenting the blur filter in `main.css` to show large scale detail.


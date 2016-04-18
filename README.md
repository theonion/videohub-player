# Videohub Player (js)

We're migrating our video players from `<iframe>` to `<bulbs-video>`.

In the transition we need to support both player types.
So the javascript code that powers the video player must be available
to <a href="//github.com/theonion/videohub">theonion/videohub</a> and
to <a href="//github.com/theonino/bulbs-elements">theonion/bulbs-elements</a>.

This repository is that place.

Long-term, the plan is for `videohub` to use `<bulbs-video>` internally
and then all the code in this project can fold directly into `bulbs-elements`.

## Installation

This library expects some dependencies to exist globally.

* `jQuery`: We're using `2.2.x`
* `video.js`: MUST be `video.js/dist/video-js/video.dev.js` @ `4.12.x` 

## Scripts #############

`scripts/ci` Runs a CI build. Runs through browser-stack on multiple browsers/devices.

`scripts/dev-build` Creates a dev build at `dist/`.

`scripts/prod-build` Creates a production build at `dist/`.

`scripts/test` Runs the test suite.

## Cutting a Release

1. Update `version` in `package.json`
1. Run `scripts/tag-and-release`

Check the output, releasing will fail if you have a dirty git
index or if tests fail. If the release succeeds this script will
print out the version tag.

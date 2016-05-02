# 0.1.4

Included the latest videojs-ga that allows for prefixing with
 tracker names.

  pass in configuration:

```javascript
new VidePlayer(videoEl, { pluginConfig: { ga: { gaPrefix: 'trackerpreifx' } });
```

# 0.1.3

* BAD BUILD *

# 0.1.2

- Fix duplicate sharetools buttons on multiple video plays

# 0.1.1

Modified `window.postMessage` `play` handler to check if the player is visible.

If the element is not visible, it will not resume play.

`Uses jQuery(el).is(':visible');` to make this check.

# 0.1.0

Ported VideoPlayer js from theonion/videohub

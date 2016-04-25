# 0.1.1

Modified `window.postMessage` `play` handler to check if the player is visible.

If the element is not visible, it will not resume play.

`Uses jQuery(el).is(':visible');` to make this check.

# 0.1.0

Ported VideoPlayer js from theonion/videohub

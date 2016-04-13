if (window.addEventListener) {
  window.addEventListener('loadedmetadata', function (event) {
    event.target.setAttribute('data-loadedmetadata', true);
  }, true);
}

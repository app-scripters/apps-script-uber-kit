##OAuth1 modifications

##repo used: https://github.com/googlesamples/apps-script-oauth1

- all files concatenated

- This is removed

OAuth.js:
```javascript
// Load the Underscore.js library. This library was added using the project
// key "MGwgKN2Th03tJ5OdmlzB8KPxhMjh3Sh48".
var _ = Underscore.load();
```

- this have been added to the bottom to make proper wrapping

```javascript
Vendor.OAuth1 = {
    createService: createService,
    MemoryProperties: MemoryProperties
};
```
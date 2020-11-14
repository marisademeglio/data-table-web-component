# Data table web component

This data table web component is built using [LitElement](https://lit-element.polymer-project.org/). 

See a [live demo](https://marisademeglio.github.io/data-table-web-component/example)


Use it in your own project: [download](https://github.com/marisademeglio/data-table-web-component/build/data-table.js)

Features:

* Reasonable set of defaults for display, searching, sorting
* Customization of data display, sorting, searching, filtering
* Mobile-friendly display with one column at a time and column switcher buttons
* Uses accessibility best practices; always looking for more feedback here though. 


## Building it from source

```bash
npm run build
```

This creates a standalone javascript file containing the component and its dependencies. The build process used here is from [LitElement's modern browser build](https://lit-element.polymer-project.org/guide/build#modern-browser-build). If your target is a different browser than what's supported there, you may have to try a different build process. They have good documentation for different approaches.

Copy `build/data-table.js` to your project.


## Using it

### Minimal example
```html
<script type="module" src="./data-table.js"></script>
<script>
    const data = {
        headers: [
            "Name",
            "Age"
        ],
        data: [
            {
                name: "Sam",
                age: 23
            },
            {
                name: "Jordan",
                age: 34
            }
        ]
    }
    document.querySelector("data-table").data = data;
</script>

<body>
    <data-table summary="Names and ages of participants" showTextSearch="true"></data-table>
</body>
```

## The defaults


### Cell display

The built-in function to calculate a header cell's displayed contents looks for information in this order:

1. If the cell data is a string, display it
2. If the cell data has a property `title`, `name`, or `value`, display it


In the case of rows, the row contents are determined to be value of the property that matches the header name (as determined above). 

So, any of the following will result in something reasonable being shown:

```js
headers = ["A", "B", "C"];
data = [
    {a: "Apple", b: "Banana", c: "Canteloupe"}, 
    {a: "Aardvark", b: "Bear", c: "Cat"}, 
    {a: "Airplane", b: "Bus", c: "Cruise ship"}
];
```

### Searching

Set `showTextSearch = true` to enable the search box. If no search function is provided, simple string matching is used, according to the display algorithm described above.


### Sorting

Set `useAutoSort = true`. to enable automatic alpha-order column sorting. You can combine `useAutoSort = true` with setting a header's `sort` attribute to `false`, to selectively disable automatic sorting.

## Customizing

All the properties:

* `columnSelectorLabel`: Title of the column selector section
* `bodyCellDisplay` :function `(header, row, headerIdx, rowIdx) =>` returns `string`
* `data`. Has two properties:
    * `headers`: Array of header data. Each can be any JSON object. Sorting info can be attached as properties per header:
        * `sort`: sorting function `(rowA, rowB) =>` returns -1, 1, or 0. Can also be `false` to disable sorting.
        * `sortIs`: `"asc"` or `"desc"`. Whether the sorting function returns data in ascending or descending order. 
    * `rows`: Array of row data. Each can be any JSON object.
* `defaultSortHeader`: Index of the header that is initially sorted. Defaults to `0`.
* `filters`: object containing filters. Each object has these properties:
    * `name`: display name of the filter
    * `path`: function `(row) =>` returns the row data relevant to the filter
    * `includeNone`: `boolean`, whether to include a "None" option, applies to when the `path` function returns null/undefined/''.
    
```js
let filters = {
    fullName: {
        name: "Name",
        path: row => row.name
    },
    age: {
        name: "Age",
        path: row => row.age
    }
};
```
* `filtersLabel`: Title of the filters section
* `headerCellDisplay`: function `(header, idx) =>` returns `string`
* `showTextSearch`: `boolean`, whether to display the text search box. Defaults to `false`.
* `textSearchFilter`: function `(text, row, headers, hiddenColumns) =>` returns `boolean`, whether the row contains the text or not.
* `useAutoSort`: `boolean`, whether to automatically sort columns alphabetically. Defaults to `false`.

### Notes

* Attach sort functions to `headers`
* You can return HTML from the `headerCellDisplay` and `bodyCellDisplay` functions
* Search only the text of what's being displayed via the `textSearchFilter` `hiddenColumns` parameter, which is an array of the indices of the hidden columns. The `headers` parameter gives all the headers in order.
* For a complex example, view the source of the [epubtest.org results grid](http://epubtest.org/results)

## About mobile display

On screens 768px or narrower, the table shows only two columns. Initially it's the first two (leftmost) columns. The first column is always fixed, and the second column can be changed via a series of buttons above the table.

The visibility of the buttons is controlled, in this example, by CSS.

The function of how many columns to show, and the restriction to 2 cols at the breakpoint width, is controlled by javascript.

## Style

### Custom properties

```
--custom-table-stripes-background-color
--custom-table-header-background-color
--custom-button-active-background-color
--custom-button-background-color
--custom-sort-icons-color
```

### Inline styles

Your custom table cell rendering markup may contain style information, via `style` attribute or element.

### External stylesheet

Use the data table element's `stylesheet` attribute to provide a stylesheet for the web component. If present, this creates a `<link>` to the stylesheet in the web component. However, this can cause a flicker of unstyled content when intially rendered. 


## Potential TODOs

Customize more text, e.g.

* The titles of the sort buttons say "Sort by _header_" but you can't change the "Sort by" part
* The search field is always called "Search"

Support multiple levels of headers

Second option for mobile adaptation: paginated view

Filters that use observable properties, to make this code less monolithic.
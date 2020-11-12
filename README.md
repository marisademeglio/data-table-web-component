# Data table web component

This data table web component is built using [LitElement](https://lit-element.polymer-project.org/). 

See a [live demo](https://marisademeglio.github.io/data-table-web-component/example)


Use it in your own project: [download](https://github.com/marisademeglio/data-table-web-component/build/data-table.js)

Features:

* Create your own header and body table cell display functions to customize how your data is displayed
* Accepts any type of data, so long as it fits into a JSON array
* Custom sorting functions
* Custom filters
* Mobile-friendly display with one column at a time and column switcher buttons
* Uses accessibility best practices; always looking for more feedback here though. 


## Building it from source

```bash
npm run build
```

This creates a standalone javascript file containing the component and its dependencies. The build process used here is from [LitElement's modern browser build](https://lit-element.polymer-project.org/guide/build#modern-browser-build). If your target is a different browser than what's supported there, you may have to try a different build process. They have good documentation for different approaches.

Copy `build/data-table.js` to your project.


## Using it

Include the script:

```html
<script type="module" src="./data-table.js"></script>
```

Use the element:
```html
<body>
    <data-table summary="The table" customclass="my-custom-class" stylesheet="/css/table-style.css"></data-table>
</body>
```

Define some data and include column sorting behavior:

```js
<script>
const data = {
    headers: [
        {
            title: "Name",
            sort: (a, b) => a > b ? 1 : -1,
            sortIs: "asc"
        },
        {
            title: "Age",
            sort: (a, b) => a > b ? 1 : -1,
            sortIs: "asc"
        }
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
</script>
```

Define some options:

```js
<script>
let options = {
    getHeaderCellDisplay: (header, idx) => header.title,
    getBodyCellDisplay (header, row, headerIdx, rowIdx) => header.title == "Name" ? row.name : row.age,
    filters: {},
    textSearchFilter: (text, row, headers, hiddenColumns) => {
        // simple searching of name and age
        return row.name.toLowerCase().indexOf(text.toLowerCase()) != -1 || 
            row.age.toLowerCase().indexOf(text.toLowerCase()) != -1;
    },
    showTextSearch: true,
    defaultSortHeader: 0,
    columnSelectorLabel: "Select a column",
    filtersLabel: "Filters",
    customClass: "my-table"
};      
</script>
```

Assign your data and options to the data-table element:

```js
<script>
document.querySelector("data-table").options = options;
document.querySelector("data-table").data = data;
</script>
```

## More about the options

Code here is generally taken from the more complicated table in `example/`.

### `getHeaderCellDisplay`
A function to return what gets displayed in the header cell. 

```js
getHeaderCellDisplay: (header, idx) => header.title;
```

### `getBodyCellDisplay`
A function to return what gets displayed in the body cell

```js
getBodyCellDisplay: (header, row, headerIdx, rowIdx) => {

    if (header.hasOwnProperty('subject')) {
        let {grades} = row;
        let grade = grades.find(aset => grade.subject === header.subject);
        let gradeSuffix = "";
        if (grade.length > 1) {
            gradeSuffix = grade[1] == "-" ? "-minus" : "-plus";
        }
        let cellClass = grade + gradeSuffix;
        let cellContent = `<span>${grade}</span>`;

        return {
            cellClass,
            cellContent
        };
    } 
    else {
        let cellClass="name";
        let cellContent = `<span>${row.name}</span>`;
        return {cellClass, cellContent};     
    }
};
```

### `filters`: 

Filters appear as a series of select boxes before the table. The options in each box are labeled according to the `name` below, and their values are populated and matched by the function given by `path`.

The option `includeNone` creates an option called "None", which will return any row for which the `path` function returns null, undefined, "null", "undefined". 

All filters always get an option called "All".

```js
filters: 
{
    age: {
        name: "Age",
        path: row => row.age
    },
    sport: {
        name: "Sport",
        path: row => row.sport,
        includeNone: true
    }
};
```

### textSearchFilter

Function to search the text by.

Parameters are:
* `text` search string
* `row` current row
* `headers` what all the headers are
* `hiddenColumns` if any columns are being hidden

```js
textSearchFilter:
(text, row, headers, hiddenColumns) => {      
    if (!row) return false;
        let idx = row.name.toLowerCase().indexOf(text.toLowerCase());
        let found = idx != -1 && idx != undefined;
        if (found) return true;

        idx = row.age.toString().indexOf(text.toLowerCase());
        found = idx != -1 && idx != undefined;
        if (found) return true;

        idx = row.sport?.toLowerCase().indexOf(text.toLowerCase());
        found = idx != -1 && idx != undefined;
        if (found) return true;

        // check each visible grade
        let grades = headers
            .filter((header, idx) => hiddenColumns.includes(idx) == false)
            .filter(header => header.hasOwnProperty('subject'))
            .map(header => {
                let grade = row.grades.find(grade => grade.subject == header.subject);
                return grade.value;
            })
            .join(' ');
        found = grades.toLowerCase().indexOf(text.toLowerCase()) != -1;
        return found;
};
```

### showTextSearch

If `true`, results in a text search box being added after the filters. Searching begins upon typing.

### defaultSortHeader

Index of the header that is initially sorted

### `columnSelectorLabel`

Labels the column selector section.

### `filtersLabel`

Labels the filters section.


## About mobile display

On screens 768px or narrower, the table shows its two leftmost columns, to start with. The first column is fixed, and the second column can be changed via a series of buttons above the table.

The visibility of the buttons is controlled, in this example, by CSS.

The function of how many columns to show, and the restriction to 2 cols at the breakpoint width, is controlled by javascript.

So, if you start with a wide screen and then shrink it down, you have to refresh before the change kicks in. This being an uncommon way to view a table, I don't think it's a big deal, but it could be improved upon to make it completely dynamically responsive. 

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

* The title of the sort buttons says "Sort by _header_" but you can't change the "Sort by" part
* The search field is always called "Search"

Introduce defaults for sorting and searching, to reduce the configuration required.

Multiple levels of headers

Second option for mobile adaptation: paginated view

Filters that use observable properties
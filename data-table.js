import {LitElement, html, css } from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

export class DataTable extends LitElement {
    static get styles() {
        return css``;
    }

    /*
    <data-table summary="..."></data-table>
    data: {
        rows: [...your row data...], 
        headers: [{
            sort: (rowA, rowB) => func to sort,
            sortIs: "asc" | "desc" which direction is the default sort behavior,
            any other fields
        }]
    },
    options: {
        defaultSortHeader: index of header to sort by, initially. 0 by default.,
        getHeaderCellDisplay: func(header, idx) to get text displayed for a header cell,
        getBodyCellDisplay: func(header, row, headerIdx, rowIdx) to get {cellClass, cellContent} displayed for a row cell,
        filters: Array [{
                name, 
                path: func(row) for what to filter,
                includeNone: boolean, if true "None" is included in the filter list and matches when path returns null/undefined
            }, 
            ... 
        ],
        textSearchFilter: (text, row, headers, hiddenColumns) evaluation function for text searching,
        showTextSearch: boolean,
        columnSelectorLabel: "Select a column",
        filtersLabel: "Filters",
        customClass: 'Class name(s)' to add to the wrapper <div class="data-table">
    }
    */
    static get properties() {
        return {
            data: {type: Object,attribute: false,},
            options: {type: Object, attribute: false},
            hiddenColumns: {type: Array, attribute: false}, // this property doesn't get set, just observed internally
            summary: {type: String},
            stylesheet: {type: String},
            customClass: {type: String}
        };
    }

    constructor() {
        super();
        this.data = {headers: [], rows: []};
        this.enabledFilters = {}; // {filterName: filterValue, ...}
        this.enabledSort = {header: null, dir: null};
        this.textSearchString = '';
        this.options = {
            textSearchFilter: (text, row, headers, hiddenColumns) => true,
            getHeaderCellDisplay: (header, idx) => '',
            getBodyCellDisplay: (header, row, headerIdx, rowIdx) => '',
            filters: [],
            sort: [],
            showTextSearch: false,
            defaultSortHeader: 0,
            columnSelectorLabel: '',
            filtersLabel: ''
        };
        this.stylesheet = '';
        this.hiddenColumns = [];
        this.customClass = ''
    }

    setFilterValue(filterName, filterValue) {
        this.enabledFilters[filterName] = filterValue;
        this.requestUpdate();
    }

    enableSort(header) {
        if (
            !header.hasOwnProperty('sort') ||
            header.sort == null ||
            header.sort == undefined
        ) {
            return;
        }
        if (this.enabledSort.header != header) {
            this.enabledSort.dir = null; //reset dir if not clicking the same header multiple times
        }
        this.enabledSort.header = header;
        let chooseOppositeSort = (dir) => (dir == 'asc' ? 'desc' : 'asc');
        let newSortDir =
            this.enabledSort.dir == null || this.enabledSort.dir == undefined
                ? header.sortIs
                : chooseOppositeSort(this.enabledSort.dir);
        this.enabledSort.dir = newSortDir;
        this.requestUpdate();
    }

    setTextSearchString(text) {
        this.textSearchString = text;
        this.requestUpdate();
    }

    calculateDisplay() {
        // start with the full dataset
        let filteredRows = this.data.rows;
        // apply each filter
        Object.keys(this.enabledFilters).map((filterId) => {
            let filterValue = this.enabledFilters[filterId];
            filteredRows = filteredRows.filter((row) =>
                this.applyFilter(row, filterId, filterValue)
            );
        });
        // apply the text search filter too
        filteredRows = filteredRows.filter((row) =>
            this.options.textSearchFilter(
                this.textSearchString,
                row,
                this.data.headers,
                this.hiddenColumns
            )
        );
        filteredRows = this.sortRows(filteredRows);
        return filteredRows;
    }

    // apply a filter to a row
    // e.g. applyFilter(row, "os", "Windows")
    applyFilter(row, filterId, filterValue) {
        if (Object.keys(this.options.filters).length == 0) {
            return true;
        }
        let rowValue = this.options.filters[filterId].path(row);
        // convert string to bool
        if (filterValue == 'true' || filterValue == 'false') {
            filterValue = filterValue == 'true';
        }
        // convert string to null
        else if (filterValue == 'undefined' || filterValue == 'null') {
            filterValue = null;
        }

        if (filterValue == 'all') {
            return true;
        }
        // filter = 'none'
        if (
            filterValue == null &&
            (rowValue == 'undefined' ||
                rowValue == null ||
                rowValue == '' ||
                rowValue == undefined)
        ) {
            return true;
        }
        return rowValue == filterValue;
    }

    // actually sort the rows by whichever header sort is enabled (or by the default, if none is selected)
    sortRows(rows) {
        
        if (this.enabledSort.header == null && this.options.hasOwnProperty('defaultSortHeader')) {
            this.enabledSort.header = this.data.headers[
                this.options.defaultSortHeader
            ];
            this.enabledSort.dir = this.enabledSort.header?.sortIs ?? 'asc';
        }
        // what are we sorting on?
        let sortedRows = this.enabledSort?.header?.hasOwnProperty('sort') ? 
            rows.sort((a, b) => this.enabledSort.header.sort(a, b))
            : 
            rows;
        
        if (this.enabledSort.header 
            && this.enabledSort.header.hasOwnProperty('sortIs')) {
            return this.enabledSort.dir == this.enabledSort.header.sortIs ? sortedRows : sortedRows.reverse();
        }
        else {
            return sortedRows;
        }
    }

    // populate a filter with all the relevant options found in this dataset
    generateFilterOptions(filter) {
        // get the unique values that this filter can have
        let filterValues = this.data.rows.map((row) => filter.path(row));

        let isBoolean = filterValues.length && typeof filterValues[0] == 'boolean';

        // make sure 'undefined', null, and '' are not counted separately
        filterValues = filterValues.map((value) =>
            value == 'undefined' ||
            value == undefined ||
            value == null ||
            (!isBoolean && value == '')
                ? null
                : value
        );

        // get only the unique values
        filterValues = Array.from(new Set(filterValues));

        // remove null as an option if we are not including "None" as a choice
        if (!filter.includeNone) {
            filterValues = filterValues.filter((value) => value != null);
        }

        let filterOptions = filterValues.map((filterValue) => ({
            value: filterValue,
        }));
        filterOptions.map((filterOption) => {
            let value = filterOption.value;
            if (typeof value === 'string' && value != '') {
                filterOption.name = value;
            } else if (typeof value === 'boolean') {
                filterOption.name = value ? 'Yes' : 'No';
                filterOption.value = filterOption.value ? 'true' : 'false';
            } else if (!value) {
                filterOption.name = 'None';
            }
            else {
                filterOption.name = value.toString();
            }
        });
        filterOptions = filterOptions.sort((a, b) => {
            let aval = typeof a.value == 'string' ? a.value.toLowerCase() : a.value;
            let bval = typeof b.value == 'string' ? b.value.toLowerCase() : b.value;
            if (aval == 'All') {
                return -1;
            }
            if (bval == 'all') {
                return 1;
            }
            if (aval == null) {
                return 1;
            }
            if (bval == null) {
                return -1;
            }
            return aval > bval ? 1 : aval < bval ? -1 : 0;
        });
        filterOptions.splice(0, 0, {name: 'All', value: 'all'});
        return filterOptions;
    }

    // remove all filtering
    clearFilters() {
        this.textSearchString = '';
        Object.keys(this.enabledFilters).map(
            (filterId) => (this.enabledFilters[filterId] = 'all')
        );
        Object.keys(this.options.filters).map((filterId) => {
            this.shadowRoot.querySelector(`#filter-${filterId}`).value = 'all';
        });
        this.requestUpdate();
    }

    // the column selector control change event
    columnSelectChange(e) {
        // get the index from the ID
        let id = e.target.id;
        let idx = parseInt(
            id.slice(id.indexOf('column-selector-') + 'column-selector-'.length)
        );
        this.hideAllColumnsExcept(idx);
    }
    //hide all columns except for 0 and i
    hideAllColumnsExcept(index) {
        if (this.data.headers.length == 0) {
            return;
        }
        let hiddenColumns = this.data.headers
            .map((header, idx) => idx)
            .filter((i) => i != 0 && i != index);
        this.hiddenColumns = hiddenColumns;
    }

    render() {
        // if we're on mobile and none of the column selector radio buttons are selected,
        // just show the first data column
        if (window.matchMedia('(max-width: 768px)').matches) {
            if (this.hiddenColumns.length == 0) {
                this.hideAllColumnsExcept(1);
            }
        }
        else {
            this.hiddenColumns = [];
        }

        let rows = this.calculateDisplay();

        let filtersHtml = this.renderFilters();

        let columnSelectorHtml = this.renderColumnSelectors();

        return html`
            ${this.stylesheet ? 
                html`<link rel="stylesheet" href="${this.stylesheet}"></link>`
                : 
                ``
            }

            <div class="data-table ${this.customClass}">
                ${filtersHtml} 
                ${columnSelectorHtml}

                <table
                    summary="${this.summary}"
                    aria-live="polite"
                    aria-colcount="${this.data.headers.length}"
                    aria-rowcount="${rows.length}"
                >
                    <thead>
                        <tr>
                            ${this.data.headers.map((header, idx) => {
                                if (this.hiddenColumns.includes(idx)) {
                                    return '';
                                }

                                let isSortable =
                                    header.hasOwnProperty('sort') &&
                                    header.sort;
                                let isSortEnabled =
                                    this.enabledSort.header == header;
                                let sortDir = '';
                                if (isSortable && isSortEnabled) {
                                    sortDir =
                                        this.enabledSort.dir == 'asc'
                                            ? 'ascending'
                                            : 'descending';
                                } else if (isSortable && !isSortEnabled) {
                                    sortDir = 'none';
                                }
                                if (isSortable) {
                                    return html` <th
                                        class="sortable"
                                        @click=${() => this.enableSort(header)}
                                        title="Sort by ${this.options.getHeaderCellDisplay(
                                            header, idx
                                        )}"
                                        aria-sort="${sortDir}"
                                    >
                                        <span tabIndex="0" role="button">
                                            ${unsafeHTML(
                                                this.options.getHeaderCellDisplay(
                                                    header, idx
                                                )
                                            )}
                                        </span>
                                    </th>`;
                                } else {
                                    return html`<th>
                                        ${unsafeHTML(
                                            this.options.getHeaderCellDisplay(
                                                header, idx
                                            )
                                        )}
                                    </th>`;
                                }
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(
                            (row, rowIdx) => html` <tr>
                                ${this.data.headers.map((header, headerIdx) => {
                                    if (
                                        this.hiddenColumns.includes(headerIdx) ==
                                        false
                                    ) {
                                        let {
                                            cellClass,
                                            cellContent,
                                        } = this.options.getBodyCellDisplay(
                                            header,
                                            row,
                                            headerIdx,
                                            rowIdx
                                        );
                                        return html`<td class="${cellClass}">
                                            ${unsafeHTML(cellContent)}
                                        </td>`;
                                    } else {
                                        return ``;
                                    }
                                })}
                            </tr>`
                        )}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderFilters() {
        /*
        Desktop

        fieldset<filters? text search?>
        table

        Mobile
        details/summary (if filters)
            <fieldset filters? text search?>
        if no filters
            text search?
        column selector
        table

        */

        let isMobile = window.matchMedia('(max-width: 768px)').matches;
        let hasDropDownFilters = Object.keys(this.options.filters).length > 0;
        let hasTextSearch = this.options.showTextSearch;

        let textSearchHtml = hasTextSearch ? 
        html` 
        <div class="text-search">
            <label for="search-filter">Search</label>
            <input
                type="text"
                id="search-filter"
                name="search"
                @keyup=${(e) =>
                    this.setTextSearchString(
                        e.target.value
                    )}
                .value="${this.textSearchString}"
            />
        </div>`
        : 
        '';
       
        let filtersHtml = '';

        if (hasDropDownFilters) {
            filtersHtml = html`
            <fieldset class="filters">
                <legend>${this.options.filtersLabel}</legend>
                ${Object.keys(this.options.filters).map(filterId => {
                    let filter = this.options.filters[filterId];
                    let filterOptions = this.generateFilterOptions(filter);
                    return html`
                    <div>
                        <label for="filter-${filterId}"
                            >${filter.name}</label
                        >
                        <select
                            id="filter-${filterId}"
                            @change="${(e) =>
                                this.setFilterValue(
                                    filterId,
                                    e.target.value
                                )}"
                        >
                            ${filterOptions.map(
                                (filterOption) => html`
                                    <option
                                        value="${filterOption.value}"
                                        ?selected=${this.enabledFilters.hasOwnProperty(
                                            filterId
                                        ) &&
                                        this.enabledFilters[
                                            filterId
                                        ] ==
                                            filterOption.value}
                                    >
                                        ${filterOption.name}
                                    </option>
                                `
                            )}
                        </select>
                    </div>`;
                })}
                ${textSearchHtml}
                <button @click=${this.clearFilters}>Reset</button>
            </fieldset>`;
            
            // if we're on mobile, then the fieldset is labelled by the summary element
            if (isMobile) {
                filtersHtml = html`
                <details ?open=${true}>
                    <summary>${this.options.filtersLabel}</summary>
                    ${filtersHtml}
                </details>`;
            }
        }
        // else does not have dropdown filters
        else {
            if (hasTextSearch) {
                filtersHtml = html`
                <fieldset class="filters">
                <legend>${this.options.filtersLabel}</legend>
                    ${textSearchHtml}
                </fieldset>`;
            }
        }
        return filtersHtml;
    }

    renderColumnSelectors() {
        if (this.data.headers.length <= 2) {
            return ``;
        }

        return html`
            <fieldset class="column-selectors">
                <legend>${this.options.columnSelectorLabel}</legend>
                ${this.data.headers.map((header, idx) =>
                    idx > 0
                        ? html`
                              <input
                                  type="radio"
                                  name="column-selector"
                                  id="column-selector-${idx}"
                                  @change=${(e) => this.columnSelectChange(e)}
                                  ?checked=${!this.hiddenColumns.includes(idx)}
                              />
                              <label for="column-selector-${idx}"
                                  >${header.title}</label
                              >
                          `
                        : ``
                )}
            </fieldset>
        `;
    }
}

window.customElements.define('data-table', DataTable);

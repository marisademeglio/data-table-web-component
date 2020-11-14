import {LitElement, html, css } from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import { dataTableStyles } from './data-table-styles.js';
import * as defaults from './data-table-defaults.js';

export class DataTable extends LitElement {
    static get styles() {
        return [
            dataTableStyles
        ];
    }

    static get properties() {
        return {
            // data: {headers, rows}
            data: {type: Object},
            // accessible table summary
            summary: {type: String},
            // external stylesheet
            stylesheet: {type: String},
            // TODO is this needed
            customClass: {type: String},
            // show a text search box
            showTextSearch: {type: Boolean},
            // default text search function
            textSearchFilter: {attribute: false},
            // default header cell display function
            headerCellDisplay: {attribute: false},
            // default body cell display function
            bodyCellDisplay: {attribute: false},
            // filters: {key: {name, path}, ...}
            filters: {type: Object, attribute: false},
            // header that gets sorted on by default (assuming there are sort functions on the headers)
            defaultSortHeader: {type: Number},
            // title for the column selectors
            columnSelectorLabel: {type: String},
            // title for the table filters
            filtersLabel: {type: String},
            // automatic sorting
            useAutoSort: {type: Boolean},
            

            // this property doesn't get set, just observed internally
            hiddenColumns: {type: Array, attribute: false}
        };
    }
    
    constructor() {
        super();
        this.version = "0.1";
        
        // internal state
        this.enabledFilters = {}; // {filterName: filterValue, ...}
        this.enabledSort = {header: null, dir: null};
        this.textSearchString = '';

        // default functions
        this.textSearchFilter = defaults.textSearchFilter;
        this.headerCellDisplay = defaults.headerCellDisplay;
        this.bodyCellDisplay = defaults.bodyCellDisplay;
        // no filters by default
        this.filters = {};
        // don't show a search box by default
        this.showTextSearch = false;
        // disable sorting by default
        this.useAutoSort = false;
        // sort on the first header by default
        this.defaultSortHeader = 0;
        // default labels
        this.columnSelectorLabel = 'Select a column';
        this.filtersLabel = 'Filters';
        // other defaults
        this.stylesheet = '';
        this.customClass = '';

        // show all cols
        this.hiddenColumns = [];
        // initial empty dataset
        this.data = {headers: [], rows: []};
    }

    setFilterValue(filterName, filterValue) {
        this.enabledFilters[filterName] = filterValue;
        this.requestUpdate();
    }

    enableSort(header) {
        if (!header.hasOwnProperty('sort') ||
            header.sort == null ||
            header.sort == undefined
        ) {
            if (this.useAutoSort && header.sort != false) {
                header.sort = (a, b) => defaults.sortAlpha(a, b, header);
                header.sortIs = 'asc';
            }
            else {
                return;
            }
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
            this.textSearchFilter(
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
        if (Object.keys(this.filters).length == 0) {
            return true;
        }
        let rowValue = this.filters[filterId].path(row);
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
        
        if (this.enabledSort.header == null && this.data.headers.length > 0) {
            this.enableSort(this.data.headers[this.defaultSortHeader]);
        }
        // what are we sorting on?
        let sortedRows = this.enabledSort?.header?.hasOwnProperty('sort') ? 
            rows.sort((a, b) => this.enabledSort.header.sort(a, b))
            : 
            rows;
        
        if (this.enabledSort.header) {
            // make sure the sortIs property is set
            if (!this.enabledSort.header.hasOwnProperty('sortIs')) {
                this.enabledSort.header.sortIs = 'asc';
            }
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
        Object.keys(this.filters).map((filterId) => {
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
                                    (header.hasOwnProperty('sort') &&
                                    header.sort) || (this.useAutoSort && header.sort != false);
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
                                        title="Sort by ${this.headerCellDisplay(
                                            header, idx
                                        )}"
                                        aria-sort="${sortDir}"
                                    >
                                        <span tabIndex="0" role="button">
                                            ${unsafeHTML(
                                                this.headerCellDisplay(
                                                    header, idx
                                                )
                                            )}
                                        </span>
                                    </th>`;
                                } else {
                                    return html`<th>
                                        ${unsafeHTML(
                                            this.headerCellDisplay(
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
                                        let cellContent = this.bodyCellDisplay(
                                            header,
                                            row,
                                            headerIdx,
                                            rowIdx
                                        );
                                        return html`
                                        <td>
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
        let isMobile = window.matchMedia('(max-width: 768px)').matches;
        let hasDropDownFilters = Object.keys(this.filters).length > 0;
        let hasTextSearch = this.showTextSearch;

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
                <legend>${this.filtersLabel}</legend>
                ${Object.keys(this.filters).map(filterId => {
                    let filter = this.filters[filterId];
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
                    <summary>${this.filtersLabel}</summary>
                    ${filtersHtml}
                </details>`;
            }
        }
        // else does not have dropdown filters
        else {
            if (hasTextSearch) {
                filtersHtml = html`
                <fieldset class="filters">
                <legend>${this.filtersLabel}</legend>
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
                <legend>${this.columnSelectorLabel}</legend>
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

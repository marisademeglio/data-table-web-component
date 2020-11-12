import { css } from 'lit-element';


export const dataTableStyles = css`

.data-table {
    --default-table-stripes-background-color: rgba(174, 195, 240, 0.2);
    --default-table-header-background-color: #6690e9;
    
    --default-button-active-background-color: rgba(174, 195, 240, 0.3);
    --default-button-background-color: rgba(0, 0, default-0, .6);

    --default-sort-icons-color: rgba(120, 120, 120);

    /* configurable */
    --table-stripes-background-color: var(--custom-table-stripes-background-color, var(--default-table-stripes-background-color));
    --table-header-background-color: var(--custom-table-header-background-color, var(--default-table-header-background-color));

    --button-active-background-color: var(--custom-button-active-background-color, var(--default-button-active-background-color));
    --button-background-color: var(--custom-button-background-color, var(--default-button-background-color));

    --sort-icons-color: var(--custom-sort-icons-color, var(--default-sort-icons-color));
    

    /* not configurable */
    --button-padding: 0.25rem;
    --button-border: thin solid rgba(0,0,0,0.4);
    --button-border-radius: 4px;
}

fieldset {
    border: none;
    padding: 0;
    margin-bottom: 1rem;
}
table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
}

th, td {
    text-align: left;
    font-size: smaller;
    font-weight: normal;
    vertical-align: top;
    padding: 2vh;
}
th {
    vertical-align: middle;
    font-weight: bolder;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--table-header-background-color);
}
button {
    border: var(--button-border);
    border-radius: var(--button-border-radius);
    padding: var(--button-padding);
    background-color: var(--button-normal-background-color);

    line-height: 1.6;
}
button:hover {
    background-color: var(--button-active-background-color);
}
select {
    border: var(--button-border);
    border-radius: var(--button-border-radius);
    height: 1.5rem;
}
input[type=text] {
    border: var(--button-border);
    border-radius: var(--button-border-radius);    
    height: 1.5rem;
}
.data-table {
    /* display: grid; */
    /* gap: 1rem; */
}
.data-table > * {
    height: min-content;
}
.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding-right: 20%;
    
}
.filters legend {
    visibility: hidden;
}
.filters label::after {
    content: ': ';
}

.filters label {
    font-size: smaller;
}

.column-selectors input[type=radio] {
    opacity: 0;
    position: fixed;
    width: 0;
}
.column-selectors label {
    border: var(--button-border);
    border-radius: var(--button-border-radius);
    background-color: var(--button-background-color);
    padding: var(--button-padding);

    display: inline-block;
    white-space: nowrap;
    margin: 1px;
    opacity: 60%;
    
}
.column-selectors input[type=radio]:checked + label {
    background-color: var(--button-active-background-color);
    text-decoration: underline;
    opacity: 100%;
}
.column-selectors input[type=radio]:not(:checked) + label:hover {
    background-color: var(--button-active-background-color);
}
thead th.sortable {
    cursor: pointer;
}
thead th.sortable::after {
    color: var(--sort-icons-color);
}
thead th.sortable[aria-sort='ascending']::after {
    content: '▲';
}
thead th.sortable[aria-sort='descending']::after {
    content: '▼';
}
tbody tr:nth-child(even) {
    background-color: var(--table-stripes-background-color);
}
table tr td:first-child span.sw {
    display: block;
}

/* hide the column selector buttons on the desktop */
@media(min-width: 769px) {
    .column-selectors {
        display: none;
    }
}
@media(max-width: 768px) {
    .filters {
        display: grid;
        margin-top: 1rem;
        gap: .5rem;
        padding-right: 0;
    }
    .filters label, .filters input {
        font-size: inherit;
    }
    .filters label {
        white-space: nowrap;
    }
    .filters div {
        display: grid;
        grid-template-columns: 30% 40% auto;
        gap: .5rem;
    }
    .filters button {
        width: min-content;
        justify-self: center;
    }
    .filters div label {
        justify-self: right;
    }
}
`;

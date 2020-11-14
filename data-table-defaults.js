let simpleCellDisplay = cell => {
    if (typeof cell === 'string') {
        return cell;
    }
    else if (cell.hasOwnProperty('title')) {
        return cell.title;
    }
    else if (cell.hasOwnProperty('name')) {
        return cell.name;
    }
    else if (cell.hasOwnProperty('value')) {
        return cell.value;
    }
    else {
        return JSON.stringify(cell);
    }
};

let textSearchFilter = (text, row, headers, hiddenColumns) => {
    let keys = headers
        .filter((header, idx) => !hiddenColumns.includes(idx))
        .map(header => simpleCellDisplay(header).toLowerCase());
    let rowString = keys.map(k => {
        if (row.hasOwnProperty(k)) {
            return simpleCellDisplay(row[k]);
        }
        else {
            return '';
        }
    }).join(' ');
    return rowString.toLowerCase().indexOf(text.toLowerCase()) != -1;
};

let headerCellDisplay = (header, idx) => simpleCellDisplay(header);

let bodyCellDisplay = (header, row, headerIdx, rowIdx) => {
    let headerText = simpleCellDisplay(header);
    if (row.hasOwnProperty(headerText.toLowerCase())) {
        return simpleCellDisplay(row[headerText.toLowerCase()]);
    }
    else {
        return '';
    }

};

let sortAlpha = (a, b, header) => {
    let val1 = bodyCellDisplay(header, a, -1, -1);
    let val2 = bodyCellDisplay(header, b, -1, -1);
    if (!val1) return 1;
    if (!val2) return -1;
    if (typeof val1 == 'string') {
        val1 = val1.toLowerCase();
    }
    if (typeof val2 == 'string') {
        val2 = val2.toLowerCase();
    }
    return val1 > val2 ? 1 : val1 < val2 ? -1 : 0;
};

export {
    textSearchFilter,
    headerCellDisplay,
    bodyCellDisplay,
    sortAlpha
};
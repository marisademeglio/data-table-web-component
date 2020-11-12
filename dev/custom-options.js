let getBodyCellDisplay = (header, row, headerIdx, rowIdx) => {
    if (!header || !row) return '';

    if (header.hasOwnProperty('subject')) {
        let grade = row.grades.find(g => g.subject === header.subject);
        let gradeSuffix = "";
        if (grade.value.length > 1) {
            gradeSuffix = grade.value[1] == "-" ? "-minus" : "-plus";
        }
        let cellClass = grade.value[0].toLowerCase() + gradeSuffix;
        let style = `
            <style>
            span.grade {
                color: green;
            }
            .grade.c, .grade.c-plus, .grade.c-minus {
                color: orange;
            }
            .grade.d, .grade.f {
                color: red;
            }
            </style>
        `;
        let cellContent = `${style}<span class="grade ${cellClass}">${grade.value}</span>`;

        return cellContent;
    } 
    else {
        let headerId = header.title.toLowerCase();
        let cellContent = `<span>${row[headerId]}</span>`;
        if (row[headerId] == undefined) {
            cellContent = `<span></span>`;
        }
        return cellContent;     
    }
};

let getHeaderCellDisplay = (header, idx) => header.title;

let filters = {
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

// return whether the row contains the text    
let textSearchFilter = (text, row, headers, hiddenColumns) => {
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

export {
    getBodyCellDisplay,
    getHeaderCellDisplay,
    filters,
    textSearchFilter
};
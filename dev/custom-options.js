let getBodyCellDisplay = (header, row, headerIdx, rowIdx) => {
    if (!header || !row) return '';

    if (header.hasOwnProperty('subject')) {
        let grade = row[header.subject];
        let gradeSuffix = "";
        if (grade.length > 1) {
            gradeSuffix = grade[1] == "-" ? "-minus" : "-plus";
        }
        let cellClass = grade[0].toLowerCase() + gradeSuffix;
        let style = `
            <style>
            span.grade {
                color: darkblue;
            }
            .grade.c, .grade.c-plus, .grade.c-minus {
                color: darkorange;
            }
            .grade.d, .grade.f {
                color: red;
            }
            </style>
        `;
        let cellContent = `${style}<span class="grade ${cellClass}">${grade}</span>`;

        return cellContent;
    } 
    else {
        let headerId = header.title.toLowerCase();
        let style = `
        <style>
        span.soccer:after {
            content: "⚽️ ";
            padding-left: 5px;
        }
        span.baseball:after {
            content: "⚾️ ";
            padding-left: 5px;
        }
        </style>
        `;
        let cellContent = "";
        if (row.hasOwnProperty(headerId)) {
            cellContent = `${style}<span class="${row[headerId].toString().toLowerCase()}"}>${row[headerId]}</span>`;
        }
        else {
            cellContent = `<span></span>`;
        }
        return cellContent;     
    }
};

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

// we'd usually just include this in with the header data
// but since we want to show a few different ways of making a table,
// the sorting algorithms are separated out here and will be merged in index.html
let headerSorts = [
    { 
        sort: (a, b) => sortAlpha(a, b, row => row.name),
        sortIs: "asc"   
    },
    {
        sort: (a, b) => sortNumeric(a, b, row => row.age),
        sortIs: "asc"
    },
    {
        sort: (a, b) => sortAlpha(a, b, row => row.sport),
        sortIs: "asc"
    },
    {
        sort: (rowA, rowB) => sortByGrade("math", rowA, rowB),
        sortIs: "desc"
    },
    {
        sort: (rowA, rowB) => sortByGrade("literature", rowA, rowB),
        sortIs: "desc"
    },
    {
        sort: (rowA, rowB) => sortByGrade("history", rowA, rowB),
        sortIs: "desc"
    }
];

// sorting utility functions
let sortAlpha = (row1, row2, path) => {
    let val1 = path(row1);
    let val2 = path(row2);
    if (!val1) return 1;
    if (!val2) return -1;
    return val1.toLowerCase() > val2.toLowerCase() ? 1 : -1;
};
let sortNumeric = (row1, row2, path) => {
    let val1 = path(row1);
    let val2 = path(row2);
    if (!val1) return 1;
    if (!val2) return -1;
    return val1 > val2 ? 1 : -1;
}

let sortByGrade = (subject, rowA, rowB) => {
    let gradeWeight = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
    let grade1 = rowA[subject];
    let grade2 = rowB[subject];
    
    let grade1idx = gradeWeight.indexOf(grade1);
    let grade2idx = gradeWeight.indexOf(grade2);

    return grade1idx > grade2idx ? -1 : 1;
};

export {
    getBodyCellDisplay,
    filters,
    headerSorts
};
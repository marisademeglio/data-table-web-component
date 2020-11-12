let sortAlpha = (val1, val2) => {
    return val1.toLowerCase() > val2.toLowerCase() ? 1 : -1;
};
let sortByAge = (rowA, rowB) => {
    return rowA.age > rowB.age ? 1 : -1;
};
let sortBySport = (rowA, rowB) => {
    // not all students have a sport listed
    if (!rowA.sport) return 1;
    if (!rowB.sport) return -1;
    return sortAlpha(rowA.sport, rowB.sport);
};
let sortByName = (rowA, rowB) => {
    return sortAlpha(rowA.name, rowB.name);
}
let gradeWeight = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
let sortByGrade = (subject, rowA, rowB) => {
    let grade1 = rowA.grades.find(grade => grade.subject === subject).value;
    let grade2 = rowB.grades.find(grade => grade.subject === subject).value;
    
    let grade1idx = gradeWeight.indexOf(grade1);
    let grade2idx = gradeWeight.indexOf(grade2);

    return grade1idx > grade2idx ? 1 : -1;
};

const data = {
    headers:[
        {
            title: "Name", 
            sort: sortByName,
            sortIs: "asc"
        }, 
        {
            title: "Age",
            sort: sortByAge,
            sortIs: "asc"
        },
        {
            title: "Sport",
            sort: sortBySport,
            sortIs: "asc"
        },
        {
            subject: "math",
            title: "Math",
            sort: (rowA, rowB) => sortByGrade("math", rowA, rowB),
            sortIs: "desc"
        }, 
        {
            subject: "literature",
            title: "Literature",
            sort: (rowA, rowB) => sortByGrade("literature", rowA, rowB),
            sortIs: "desc"
        },
        {
            subject: "history",
            title: "History",
            sort: (rowA, rowB) => sortByGrade("history", rowA, rowB),
            sortIs: "desc"
        }
    ],
    rows: [
        {
            name: "Drew",
            age: 12,
            sport: "Baseball",
            grades: [
                {
                    subject: "math",
                    value: "A"
                },
                {
                    subject: "literature",
                    value: "B"
                },
                {
                    subject: "history",
                    value: "B+"
                }
            ]
        },
        {
            name: "Taylor",
            age: 12,
            sport: "Soccer",
            grades: [
                {
                    subject: "math",
                    value: "C+"
                },
                {
                    subject: "literature",
                    value: "B+"
                },
                {
                    subject: "history",
                    value: "A"
                }
            ]
        },
        {
            name: "Terry",
            age: 10,
            grades: [
                {
                    subject: "math",
                    value: "A"
                },
                {
                    subject: "literature",
                    value: "D"
                },
                {
                    subject: "history",
                    value: "A"
                }
            ]
        },
        {
            name: "Lou",
            age: 10,
            sport: "Soccer",
            grades: [
                {
                    subject: "math",
                    value: "A"
                },
                {
                    subject: "literature",
                    value: "B-"
                },
                {
                    subject: "history",
                    value: "F"
                }
            ]
        },
        {
            name: "Robin",
            age: 9,
            grades: [
                {
                    subject: "math",
                    value: "A+"
                },
                {
                    subject: "literature",
                    value: "B"
                },
                {
                    subject: "history",
                    value: "B+"
                }
            ]
        },
        {
            name: "Alex",
            age: 19,
            sport: "Baseball",
            grades: [
                {
                    subject: "math",
                    value: "B+"
                },
                {
                    subject: "literature",
                    value: "C+"
                },
                {
                    subject: "history",
                    value: "B+"
                }
            ]
        }
    ]
};
export {data};
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentstep = 0;
let correct = 0;
let currentTaskIndex = null;
let currentpriority = null;
let currentanswer = null;
let modal;

function savetasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function addtasks() {
    const text = document.getElementById("task-input").value;
    const priority = document.getElementById("priority").value;

    tasks.push({ text, priority });
    savetasks();
    rendertasks();
}

function deletetasks(index) {
    tasks.splice(index, 1);
    savetasks();
    rendertasks();
}

function generatequadratic() {
    let a;

    let x1 = Math.floor(Math.random() * 10) - 5;
    let x2 = Math.floor(Math.random() * 10) - 5;

    do {
        a = Math.floor(Math.random() * 3) + 1;
    } while (a === 0);

    let b = -a * (x1 + x2);
    let c = a * x1 * x2;

    return { a, b, c, answers: [x1, x2] };
}

function generatenonlinearsimaltaneous() {
    let x1 = Math.floor(Math.random() * 7) - 3;
    let x2;
    do {
        x2 = Math.floor(Math.random() * 7) - 3;
    } while (x2 === x1);

    let a1 = Math.floor(Math.random() * 5) + 1;
    let b1 = Math.floor(Math.random() * 5) - 2;
    let c1 = Math.floor(Math.random() * 10) - 5;

    let y1 = a1 * x1 * x1 + b1 * x1 + c1;
    let y2 = a1 * x2 * x2 + b1 * x2 + c1;

    let a2;
    do {
        a2 = Math.floor(Math.random() * 5) - 2;
    } while (a2 === a1);

    let numerator = y1 - y2 - a2 * (x1 * x1 - x2 * x2);
    let denominator = x1 - x2;

    if (denominator === 0 || numerator % denominator !== 0) {
        return generatenonlinearsimaltaneous();
    }

    let b2 = numerator / denominator;
    let c2 = y1 - a2 * x1 * x1 - b2 * x1;

    return { a1, b1, c1, a2, b2, c2, answers: [[x1, y1], [x2, y2]]};
}

function generatelinearsimaltaneous() {
    let x = Math.floor(Math.random() * 10) - 5;
    let y = Math.floor(Math.random() * 10) - 5;

    let a1, b1, a2, b2;
    do {
        a1 = Math.floor(Math.random() * 5) + 1;
        b1 = Math.floor(Math.random() * 5) + 1;

        a2 = Math.floor(Math.random() * 5) + 1;
        b2 = Math.floor(Math.random() * 5) + 1;
    } while (a1 * b1 === a2 * b2);

    let c1 = a1 * x + b1 * y;
    let c2 = a2 * x + b2 * y;

    return { a1, b1, c1, a2, b2, c2, answers: [x, y] };
}

function parseXY(str) {
    str = str.replace(/[()\[\]]/g, "").trim();

    if (str.includes('x') && str.includes('y')) {
        const match = str.match(/x\s*[:=]?\s*([-+]?\d*\.?\d+)\s*y\s*[:=]?\s*([-+]?\d*\.?\d+)/i);
        if (match) return [Number(match[1]), Number(match[2])];
        return null;
    }
    
    const parts = str.split(',').map(s => Number(s.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    return parts;
}

function approxequal(a, b, tolerance = 0.01) {
    return Math.abs(a - b) < tolerance;
}

function attemptdelete(index, priority) {
    currentstep = 0;
    correct = 0;
    currentTaskIndex = index;
    currentpriority = priority;

    nextquestion();
    modal.show();
}

function nextquestion() {
    const question = document.getElementById("question");
    const input1 = document.getElementById("answer1");
    const input2 = document.getElementById("answer2");

    input1.value = "";
    input2.value = "";
    input1.placeholder = "First value";
    input2.placeholder = "Second value";

    if (currentpriority === "high") {
        const { a, b, c, answers } = generatenonlinearsimaltaneous();
        currentanswer = answers;

        question.innerText = `Solve:\ny = ${a1}x² + ${b1}x + ${c1}\ny = ${a2}x² + ${b2}x + ${c2}`;

        input1.placeholder = "First solution: (x,y)";
        input2.placeholder = "Second solution: (x,y)";

        input2.style.display = "block";
    } else if (currentpriority === "medium") {
        const { a, b, c, answers } = generatequadratic();
        currentanswer = answers;

        question.innerText = `Solve: ${a}x² + ${b}x + ${c} = 0`;

        input1.placeholder = "First x value";
        input2.placeholder = "Second x value";

        input2.style.display = "block";
    } else {
        const { a1, b1, c1, a2, b2, c2, answers } = generatelinearsimaltaneous();
        currentanswer = answers;

        question.innerText = `Solve: \n${a1}x + ${b1}y = ${c1} \n${a2}x + ${b2}y = ${c2}`;

        input1.placeholder = "Value of x";
        input2.placeholder = "Value of y";

        input2.style.display = "block";
    }
}

function rendertasks() {
    tasks.sort(() => Math.random() - 0.5);
    const list = document.getElementById("tasklist");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li")
        li.innerHTML = `${task.text}: ${task.priority} priority <button class="delete-task">Delete Task</button>`;

        const deletebtn = li.querySelector("button");
        deletebtn.addEventListener("click", () => {
            attemptdelete(index, task.priority);
        });

        list.appendChild(li);
        li.style.fontSize = `${12 + Math.random() * 20}px`;
    });
}

window.addEventListener("DOMContentLoaded", () => {
    modal = new bootstrap.Modal(document.getElementById("mathmodal"));

    const addbutton = document.getElementById("add-task");
    addbutton.addEventListener("mouseover", () => {
        let xaxis = Math.random() * window.innerWidth / 2;
        let yaxis = Math.random() * window.innerHeight / 2;
        addbutton.style.transform = `translate(${xaxis}px, ${yaxis}px)`;
    });

    document.getElementById("submit-answer").addEventListener("click", () => {
        const val1 = parseFloat(document.getElementById("answer1").value);
        const val2 = parseFloat(document.getElementById("answer2").value);

        let iscorrect = false;

        if (currentpriority === "high") {
            const val1 = document.getElementById("answer1").value.trim();
            const val2 = document.getElementById("answer2").value.trim();

            const sol1 = parseXY(val1);
            const sol2 = parseXY(val2);

            if (!sol1 || !sol2) {
                alert(`Enter each solution as "x, y" you nitwit.`);
                return;
            }

            iscorrect = (approxequal(sol1[0], currentanswer[0][0]) && approxequal(sol1[1], currentanswer[0][1]) && approxequal(sol2[0], currentanswer[1][0]) && approxequal(sol2[1], currentanswer[1][1]))
                || (approxequal(sol1[0], currentanswer[1][0]) && approxequal(sol1[1], currentanswer[1][1]) && approxequal(sol2[0], currentanswer[0][0]) && approxequal(sol2[1], currentanswer[0][1]));
        }

        else if (currentpriority === "medium") {
            if (isNaN(val1) || isNaN(val2)) {
                alert("Enter both x values, you fathead."); g
                return;
            }

            iscorrect = (approxequal(val1, currentanswer[0]) && approxequal(val2, currentanswer[1])) 
                || (approxequal(val1, currentanswer[1]) && approxequal(val2, currentanswer[0]));
        }

        else {
            if (isNaN(val1) || isNaN(val2)) {
                alert("Enter both x and y values, you nimrod.");
                return;
            }

            iscorrect = approxequal(val1, currentanswer[0]) && approxequal(val2, currentanswer[1]);
        }

        if (iscorrect) {
            correct++;
            currentstep++;

            if (currentstep === 3) {
                modal.hide();
                deletetasks(currentTaskIndex);
            } else {
                nextquestion();
            }

        } else {
            modal.hide();
            alert("Wrong answer you imbecile, the task lives to see another day.");
        }
    });

    rendertasks();
});

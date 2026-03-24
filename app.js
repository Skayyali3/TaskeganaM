let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentstep = 0;
let correct = 0;
let currentTaskIndex = null;
let currentanswer = null;
let modal;
let currentQuestionType;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function addTasks() {
    const text = document.getElementById("task-input").value;
    const priority = document.getElementById("priority").value;

    tasks.push({ text, priority });
    saveTasks();
    renderTasks();
}

function deleteTasks(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    tasks.sort(() => Math.random() - 0.5);
    const list = document.getElementById("tasklist");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li")
        li.innerHTML = `${task.text}: ${task.priority} priority <button class="delete-task">Delete Task</button>`;

        const deletebtn = li.querySelector("button");
        deletebtn.addEventListener("click", () => {
            attemptDeletion(index);
        });

        list.appendChild(li);
        li.style.fontSize = `${12 + Math.random() * 20}px`;
    });
}

function generate_quadratic() {
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

function generate_nonlinear_simaltaneous(attempts = 0) {
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
    } while (a2 === a1 || a2 === 0);

    let numerator = y1 - y2 - a2 * (x1 * x1 - x2 * x2);
    let denominator = x1 - x2;

    if ((denominator === 0 || numerator % denominator !== 0) && attempts <= 20) {
        return generate_nonlinear_simaltaneous(attempts + 1);
    }

    let b2 = numerator / denominator;
    let c2 = y1 - a2 * x1 * x1 - b2 * x1;

    if (attempts > 20) {
        a1 = 3; b1 = 1; c1 = -5;
        a2 = 2; b2 = 2; c2 = 1;
        x1 = 3; x2 = -2;
        y1 = a1 * x1 * x1 + b1 * x1 + c1;
        y2 = a2 * x2 * x2 + b2 * x2 + c2;
    }

    return { a1, b1, c1, a2, b2, c2, answers: [[x1, y1], [x2, y2]] };
}

function generate_linear_simaltaneous() {
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

function approxEqual(a, b, tolerance = 0.01) {
    return Math.abs(a - b) < tolerance;
}

function attemptDeletion(index) {
    currentstep = 0;
    correct = 0;
    currentTaskIndex = index;

    get_next_question();
    modal.show();
}

function get_next_question() {
    const question = document.getElementById("question");
    const input1 = document.getElementById("answer1");
    const input2 = document.getElementById("answer2");

    input1.value = "";
    input2.value = "";
    input1.placeholder = "First value";
    input2.placeholder = "Second value";

    const r = Math.random();

    if (r <= 0.33) {
        const { a1, b1, c1, a2, b2, c2, answers } = generate_linear_simaltaneous();
        currentQuestionType = 'linear';
        currentanswer = answers;

        question.innerText = `Solve: \n${a1}x + ${b1}y = ${c1} \n${a2}x + ${b2}y = ${c2}`;

        input1.placeholder = "Value of x";
        input2.placeholder = "Value of y";

        input2.style.display = "block";
    } else if (r <= 0.66) {
        const { a, b, c, answers } = generate_quadratic();
        currentQuestionType = 'quadratic';
        currentanswer = answers;

        question.innerText = `Solve: ${a}x² + ${b}x + ${c} = 0`;

        input1.placeholder = "First x value";
        input2.placeholder = "Second x value";

        input2.style.display = "block";
    } else {
        const { a1, b1, c1, a2, b2, c2, answers } = generate_nonlinear_simaltaneous();
        currentQuestionType = "nonlinear";
        currentanswer = answers;

        question.innerText = `Solve:\ny = ${a1}x² + ${b1}x + ${c1}\ny = ${a2}x² + ${b2}x + ${c2}`;

        input1.placeholder = "First solution: (x,y)";
        input2.placeholder = "Second solution: (x,y)";

        input2.style.display = "block";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    modal = new bootstrap.Modal(document.getElementById("mathmodal"));

    const addbutton = document.getElementById("add-task");
    addbutton.addEventListener("mouseover", () => {
        let xAxis = Math.random() * window.innerWidth / 2;
        let yAxis = Math.random() * window.innerHeight / 2;
        addbutton.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
    });

    document.getElementById("submit-answer").addEventListener("click", () => {
        const val1 = parseFloat(document.getElementById("answer1").value.trim());
        const val2 = parseFloat(document.getElementById("answer2").value.trim());

        let iscorrect = false;

        if (currentQuestionType === "nonlinear") {
            const sol1 = parseXY(val1);
            const sol2 = parseXY(val2);

            if (!sol1 || !sol2) {
                alert(`Enter each solution as "x, y" you nitwit.`);
                return;
            }

            iscorrect = (approxEqual(sol1[0], currentanswer[0][0]) && approxEqual(sol1[1], currentanswer[0][1]) && approxEqual(sol2[0], currentanswer[1][0]) && approxEqual(sol2[1], currentanswer[1][1]))
                || (approxEqual(sol1[0], currentanswer[1][0]) && approxEqual(sol1[1], currentanswer[1][1]) && approxEqual(sol2[0], currentanswer[0][0]) && approxEqual(sol2[1], currentanswer[0][1]));
        }

        else if (currentQuestionType === "quadratic") {
            if (isNaN(val1) || isNaN(val2)) {
                alert("Enter both x values, you fathead.");
                return;
            }

            iscorrect = (approxEqual(val1, currentanswer[0]) && approxEqual(val2, currentanswer[1])) 
                || (approxEqual(val1, currentanswer[1]) && approxEqual(val2, currentanswer[0]));
        }

        else {
            if (isNaN(val1) || isNaN(val2)) {
                alert("Enter both x and y values, you nimrod.");
                return;
            }

            iscorrect = approxEqual(val1, currentanswer[0]) && approxEqual(val2, currentanswer[1]);
        }

        if (iscorrect) {
            correct++;
            currentstep++;

            if (currentstep === 3) {
                modal.hide();
                deleteTasks(currentTaskIndex);
            } else {
                get_next_question();
            }

        } else {
            modal.hide();
            alert("Wrong answer you imbecile, the task lives to see another day.");
        }
    });

    renderTasks();
});

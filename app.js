const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

const themeLink = document.getElementById("water-theme");

document.getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

document.getElementById("btn-html")
    .addEventListener("click", () => {
        processTdl("todo2html.sef.json");
    });

document.getElementById("btn-md")
    .addEventListener("click", () => {
        processTdl("todo2md.sef.json");
    });

fileInput.addEventListener(
    "change",
    handleFileSelect
);

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", e => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file) {
        loadFile(file);
    }
});

function handleFileSelect(event) {

    const file = event.target.files[0];

    if (file) {
        loadFile(file);
    }
}

function loadFile(file) {

    const reader = new FileReader();

    reader.onload = function() {

        inputText.value = reader.result;

    };

    reader.readAsText(file);
}

async function processTdl(sefFile) {

    outputText.value = "Processing...";

    try {

        const result = await SaxonJS.transform({
            stylesheetLocation: sefFile,
            sourceText: inputText.value,
            destination: "serialized"
        });

        outputText.value =
            result.principalResult;

    } catch (err) {

        outputText.value =
            "ERROR\n\n" + err.message;

        console.error(err);
    }
}

function toggleTheme() {

    const current = themeLink.href;

    if (current.includes("water.css")) {

        themeLink.href =
            "https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css";

    } else {

        themeLink.href =
            "https://cdn.jsdelivr.net/npm/water.css@2/out/water.css";
    }
}
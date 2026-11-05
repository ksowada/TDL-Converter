const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const themeLink = document.getElementById("water-theme");
const outputSource = document.getElementById("outputSource");
const outputPreview = document.getElementById("outputPreview");

let currentOutput = "";
let currentMode = "html";

document.getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

document.getElementById("btn-html")
    .addEventListener("click", () => {
        processTdl("todo2html.sef.json", "html");
    });

document.getElementById("btn-md")
    .addEventListener("click", () => {
        processTdl("todo2md.sef.json", "markdown");
    });

document.querySelectorAll("input[name='outputView']").forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.value === "preview") {
            showPreview();
        } else {
            showSource();
        }
    });
});

fileInput.addEventListener("change", handleFileSelect);

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
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

function decodeTdlBytes(buffer) {
    const bytes = new Uint8Array(buffer);

    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        return new TextDecoder("utf-16le").decode(bytes);
    }

    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        return new TextDecoder("utf-16be").decode(bytes);
    }

    return new TextDecoder("utf-8").decode(bytes);
}

function loadFile(file) {
    const reader = new FileReader();

    reader.onload = function () {
        inputText.value = decodeTdlBytes(reader.result);
    };

    reader.readAsArrayBuffer(file);
}

outputSource.addEventListener("input", () => {
    currentOutput = outputSource.value;
});

function showSource() {
    outputSource.classList.remove("hidden");
    outputPreview.classList.add("hidden");
}

function showPreview() {
    currentOutput = outputSource.value;
    outputPreview.classList.remove("hidden");
    outputSource.classList.add("hidden");
    renderPreview();
}

function updateOutput(content, mode = "html") {
    currentOutput = content;
    currentMode = mode;
    outputSource.value = content;

    if (!outputPreview.classList.contains("hidden")) {
        renderPreview();
    }
}

function renderPreview() {
    if (currentMode === "markdown") {
        if (typeof marked !== "undefined") {
            const html = typeof marked.parse === "function"
                ? marked.parse(currentOutput)
                : marked(currentOutput);
            outputPreview.innerHTML = html;
        } else {
            outputPreview.innerHTML =
                "<p><strong>marked.js was not loaded.</strong></p>";
        }
        return;
    }

    outputPreview.innerHTML = currentOutput;
}

async function processTdl(sefFile, mode) {
    updateOutput("Processing...", mode);

    try {
        const result = await SaxonJS.transform({
            stylesheetLocation: sefFile,
            sourceText: inputText.value,
            destination: "serialized"
        }, "async");

        updateOutput(result.principalResult || "", mode);
    } catch (err) {
        updateOutput("ERROR\n\n" + err.message, mode);
        console.error(err);
    }
}

const WATER_CSS_BASE = "https://cdn.jsdelivr.net/npm/water.css@2/out/";

function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeLink.href = WATER_CSS_BASE + theme + ".css";

    // Button shows the theme you will switch TO.
    const btn = document.getElementById("theme-toggle");
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    applyTheme(next);

    try {
        localStorage.setItem("tdl-theme", next);
    } catch (e) {
        // storage may be unavailable (privacy mode) – ignore
    }
}

// Sync button icon with the theme chosen by the inline script in <head>.
applyTheme(getTheme());

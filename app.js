const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");
const fileNameEl = document.getElementById("fileName");
const dropZone = document.getElementById("dropZone");
const themeLink = document.getElementById("water-theme");
const outputSource = document.getElementById("outputSource");
const outputPreview = document.getElementById("outputPreview");
const outputModeEl = document.getElementById("outputMode");
const statusEl = document.getElementById("status");
const convertButtons = [
    document.getElementById("btn-html"),
    document.getElementById("btn-md")
];

let currentOutput = "";
let currentMode = "html";
let baseFileName = "todolist";

const MODES = {
    html: { sef: "todo2html.sef.json", label: "HTML", ext: "html", mime: "text/html" },
    markdown: { sef: "todo2md.sef.json", label: "Markdown", ext: "md", mime: "text/markdown" }
};

/* ---- Event Wiring ------------------------------------------------------- */

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
document.getElementById("btn-html").addEventListener("click", () => processTdl("html"));
document.getElementById("btn-md").addEventListener("click", () => processTdl("markdown"));
document.getElementById("btn-clear").addEventListener("click", clearInput);
document.getElementById("btn-copy").addEventListener("click", copyOutput);
document.getElementById("btn-download").addEventListener("click", downloadOutput);

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

// Drag & drop onto input panel
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove("dragover");
    }
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (file) {
        loadFile(file);
    }
});

// Prevent accidental browser navigation on drop outside
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => e.preventDefault());

// Keep current output in sync when user edits the source textarea directly
outputSource.addEventListener("input", () => {
    currentOutput = outputSource.value;
    if (!outputPreview.classList.contains("hidden")) {
        renderPreview();
    }
});

/* ---- Input Handling ----------------------------------------------------- */

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        loadFile(file);
    }
}

function decodeTdlBytes(buffer) {
    const bytes = new Uint8Array(buffer);

    // UTF-16 LE BOM (FF FE)
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        return new TextDecoder("utf-16le").decode(bytes);
    }

    // UTF-16 BE BOM (FE FF)
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        return new TextDecoder("utf-16be").decode(bytes);
    }

    // Default: UTF-8
    return new TextDecoder("utf-8").decode(bytes);
}

function loadFile(file) {
    const reader = new FileReader();

    reader.onload = function () {
        inputText.value = decodeTdlBytes(reader.result);
        baseFileName = file.name.replace(/\.[^.]+$/, "") || "todolist";
        if (fileNameEl) {
            fileNameEl.textContent = `(${file.name})`;
            fileNameEl.title = `${file.name} (${formatBytes(file.size)})`;
        }
        setStatus(`Loaded ${file.name} (${formatBytes(file.size)})`, false, true);
    };

    reader.onerror = function () {
        setStatus(`Failed to read ${file.name}`, true);
    };

    reader.readAsArrayBuffer(file);
}

function clearInput() {
    inputText.value = "";
    fileInput.value = "";
    if (fileNameEl) {
        fileNameEl.textContent = "(.tdl / XML)";
        fileNameEl.title = "";
    }
    baseFileName = "todolist";
    setStatus("Input cleared");
    inputText.focus();
}

/* ---- Output & Preview --------------------------------------------------- */

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

function updateOutput(content, mode = currentMode) {
    currentOutput = content;
    currentMode = mode;
    outputSource.value = content;
    outputModeEl.textContent = MODES[mode] ? MODES[mode].label : "";

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
                "<p><strong>marked.js could not be loaded.</strong></p>";
        }
        return;
    }

    outputPreview.innerHTML = currentOutput;
}

async function copyOutput() {
    const text = outputSource.value;
    if (!text) {
        setStatus("Nothing to copy", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        setStatus("✓ Copied to clipboard", false, true);
    } catch (e) {
        // Fallback for non-HTTPS or unsupported browsers
        showSource();
        const radio = document.querySelector("input[name='outputView'][value='source']");
        if (radio) radio.checked = true;
        outputSource.select();
        document.execCommand("copy");
        setStatus("✓ Copied to clipboard", false, true);
    }
}

function downloadOutput() {
    const text = outputSource.value;
    if (!text) {
        setStatus("Nothing to download", true);
        return;
    }

    const mode = MODES[currentMode] || MODES.html;
    const blob = new Blob([text], { type: `${mode.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFileName}.${mode.ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`✓ Downloaded ${a.download}`, false, true);
}

/* ---- Conversion Engine -------------------------------------------------- */

async function processTdl(mode) {
    const cfg = MODES[mode];

    if (!inputText.value.trim()) {
        setStatus("Please open, drop or paste a .tdl file first", true);
        return;
    }

    if (typeof SaxonJS === "undefined") {
        setStatus("SaxonJS runtime not available", true);
        return;
    }

    convertButtons.forEach((b) => (b.disabled = true));
    setStatus(`Converting to ${cfg.label}…`);
    const started = performance.now();

    try {
        const result = await SaxonJS.transform({
            stylesheetLocation: cfg.sef,
            sourceText: inputText.value,
            destination: "serialized"
        }, "async");

        updateOutput(result.principalResult || "", mode);
        const ms = Math.round(performance.now() - started);
        setStatus(`✓ Converted to ${cfg.label} in ${ms} ms`, false, true);
    } catch (err) {
        updateOutput("ERROR\n\n" + err.message, mode);
        setStatus(`Conversion error: ${err.message}`, true);
        console.error(err);
    } finally {
        convertButtons.forEach((b) => (b.disabled = false));
    }
}

/* ---- Status & Utilities ------------------------------------------------- */

function setStatus(message, isError = false, isSuccess = false) {
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", isError);
        statusEl.classList.toggle("success", isSuccess);
    }
}

function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/* ---- Theme Toggling ----------------------------------------------------- */

const WATER_CSS_BASE = "https://cdn.jsdelivr.net/npm/water.css@2/out/";

function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeLink.href = WATER_CSS_BASE + theme + ".css";

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
        // LocalStorage may be blocked in strict private browsing
    }
}

// Sync button icon with initial theme
applyTheme(getTheme());

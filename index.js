// --- BEGIN: Robust core logic for leads tracker WITH TAG SUPPORT ---
let myLeads = [];
const inputEl = document.getElementById("input-el");
const noteEl = document.getElementById("note-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const tabBtn = document.getElementById("tab-btn");
const noteFeedback = document.getElementById('note-feedback');
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const importFeedback = document.getElementById("import-feedback");

// Remove global tag input if present
const globalTagInput = document.getElementById('tag-input');
if (globalTagInput) globalTagInput.remove();

function saveLeads() {
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
    render(myLeads);
}

function loadLeads() {
    const leads = JSON.parse(localStorage.getItem("myLeads"));
    return Array.isArray(leads) ? leads : [];
}

function getAllTags(leads) {
    const tagSet = new Set();
    leads.forEach(lead => (lead.tags||[]).forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
}

function renderTagFilter() {
    let tagFilterDiv = document.getElementById('tag-filter-div');
    if (!tagFilterDiv) {
        tagFilterDiv = document.createElement('div');
        tagFilterDiv.id = 'tag-filter-div';
        tagFilterDiv.className = 'mb-3';
        ulEl.parentNode.insertBefore(tagFilterDiv, ulEl);
    }
    const allTags = getAllTags(myLeads);
    tagFilterDiv.innerHTML = `<label for="tag-filter">Filter by tag:</label> <select id="tag-filter" class="form-select form-select-sm" style="max-width:140px;display:inline-block;width:auto;"><option value="">All</option>${allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}</select>`;
    const tagFilter = document.getElementById('tag-filter');
    tagFilter.value = window.activeTagFilter || '';
    tagFilter.onchange = function() {
        window.activeTagFilter = tagFilter.value;
        render(myLeads);
    };
}
window.activeTagFilter = '';

function render(leads) {
    renderTagFilter();
    let filtered = leads;
    if (window.activeTagFilter) {
        filtered = leads.filter(lead => (lead.tags||[]).includes(window.activeTagFilter));
    }
    ulEl.innerHTML = "";
    if (!filtered.length) {
        const li = document.createElement("li");
        li.className = "list-group-item text-center";
        li.textContent = "No leads saved.";
        ulEl.appendChild(li);
        return;
    }
    filtered.forEach((lead, idx) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex align-items-center justify-content-between";
        li.innerHTML = `
            <div style="flex:1;min-width:0;">
                <a target="_blank" href="${lead.url}" style="font-weight:500;word-break:break-all;">${lead.url}</a>
                <div class="d-flex flex-wrap align-items-center mt-1 mb-1 gap-1">
                    ${(lead.tags||[]).map((tag, tagIdx) => `
                        <span class='badge rounded-pill px-2 py-1' style='background:#A9B388;color:#5F6F52;font-size:0.85em;display:flex;align-items:center;'>
                            ${tag}
                            <button class='btn btn-sm btn-link p-0 ms-1 remove-tag-btn' data-lead-idx='${idx}' data-tag-idx='${tagIdx}' title='Remove tag' style='color:#5F6F52;font-size:1em;'>&times;</button>
                        </span>
                    `).join('')}
                    <input type='text' class='form-control form-control-sm tag-input-inline' placeholder='Add tag' style='max-width:90px;display:inline-block;width:auto;'>
                    <button class='btn btn-outline-success btn-sm add-tag-btn' data-index='${idx}' title='Add tag'>+</button>
                </div>
                <div class="note-section mt-1">
                    <span class="text-muted small">Note:</span>
                    <span class="note-text" data-index="${idx}" style="cursor:pointer;min-width:40px;display:inline-block;">${lead.note ? lead.note : '<span style=\'color:#ccc\'>Click to add note</span>'}</span>
                </div>
            </div>
            <button class="delete-link-btn btn btn-sm btn-outline-danger ms-2" data-index="${idx}" title="Delete">&times;</button>
        `;
        ulEl.appendChild(li);
    });
    // Delete lead
    document.querySelectorAll('.delete-link-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            myLeads.splice(idx, 1);
            saveLeads();
        };
    });
    // Add tag
    document.querySelectorAll('.add-tag-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const input = ulEl.querySelectorAll('.tag-input-inline')[idx];
            const tag = input.value.trim();
            if (tag && !myLeads[idx].tags.includes(tag)) {
                myLeads[idx].tags.push(tag);
                saveLeads();
            }
            input.value = '';
        };
    });
    // Remove tag
    document.querySelectorAll('.remove-tag-btn').forEach(btn => {
        btn.onclick = function(e) {
            const leadIdx = parseInt(this.getAttribute('data-lead-idx'));
            const tagIdx = parseInt(this.getAttribute('data-tag-idx'));
            myLeads[leadIdx].tags.splice(tagIdx, 1);
            saveLeads();
            e.stopPropagation();
        };
    });
    // Inline note editing
    document.querySelectorAll('.note-text').forEach(span => {
        span.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const currentNote = myLeads[idx].note || '';
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentNote;
            input.className = 'form-control form-control-sm';
            input.style.maxWidth = '200px';
            input.style.display = 'inline-block';
            input.style.marginLeft = '4px';
            input.maxLength = 200;
            this.replaceWith(input);
            input.focus();
            input.select();
            function saveNote() {
                myLeads[idx].note = input.value.trim();
                saveLeads();
            }
            input.addEventListener('blur', saveNote);
            input.addEventListener('keydown', function(ev) {
                if (ev.key === 'Enter') {
                    input.blur();
                }
            });
        };
    });
}

inputBtn.onclick = function() {
    const url = inputEl.value.trim();
    const note = noteEl.value.trim();
    if (!url) {
        inputEl.classList.add("is-invalid");
        setTimeout(() => inputEl.classList.remove("is-invalid"), 2000);
        return;
    }
    if (note.length > 200) {
        noteEl.classList.add("is-invalid");
        noteFeedback.textContent = "Note must be less than 200 characters.";
        noteFeedback.style.display = "block";
        setTimeout(() => {
            noteEl.classList.remove("is-invalid");
            noteFeedback.style.display = "none";
        }, 2500);
        return;
    }
    // Ensure tags array exists
    const tags = [];
    myLeads.push({ url, note, tags });
    inputEl.value = "";
    noteEl.value = "";
    saveLeads();
};

tabBtn.onclick = function() {
    let note = noteEl.value.trim();
    // Ensure tags array exists
    const tags = [];
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if (tabs && tabs[0] && tabs[0].url) {
                myLeads.push({ url: tabs[0].url, note, tags });
                saveLeads();
                noteEl.value = "";
            }
        });
    }
};

deleteBtn.onclick = function() {
    if (confirm("Delete all leads?")) {
        myLeads = [];
        saveLeads();
    }
};

exportBtn.onclick = function() {
    if (!myLeads.length) {
        alert("No leads to export.");
        return;
    }
    let csv = "URL,Note,Tags\n";
    myLeads.forEach(lead => {
        csv += `"${lead.url.replace(/"/g, '""')}","${(lead.note || '').replace(/"/g, '""')}","${(lead.tags||[]).join(';').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
};

importBtn.onclick = function() {
    importFile.value = "";
    importFile.click();
};

importFile.onchange = function() {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.trim().split(/\r?\n/);
        if (!/^\s*URL\s*,\s*Note\s*,\s*Tags\s*$/i.test(lines[0])) {
            importFeedback.textContent = "Invalid CSV format.";
            importFeedback.style.display = "block";
            return;
        }
        let added = 0;
        for (let i = 1; i < lines.length; i++) {
            const match = lines[i].match(/^\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*$/);
            if (match) {
                const url = match[1];
                const note = match[2];
                const tags = match[3] ? match[3].split(';').map(t => t.trim()).filter(Boolean) : [];
                if (!myLeads.some(l => l.url === url && l.note === note && JSON.stringify(l.tags||[]) === JSON.stringify(tags))) {
                    myLeads.push({ url, note, tags });
                    added++;
                }
            }
        }
        saveLeads();
        importFeedback.textContent = `Imported ${added} new lead(s).`;
        importFeedback.style.display = "block";
        setTimeout(() => importFeedback.style.display = "none", 2000);
    };
    reader.readAsText(file);
};

// Initial load
myLeads = loadLeads();
render(myLeads);
// --- END: Robust core logic for leads tracker WITH TAG SUPPORT ---
let myLeads = []
const inputEl = document.getElementById("input-el")
const noteEl = document.getElementById("note-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const leadsFromLocalStorage = JSON.parse( localStorage.getItem("myLeads") )
const tabBtn = document.getElementById("tab-btn")
const noteFeedback = document.getElementById('note-feedback');
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const importFeedback = document.getElementById("import-feedback");

// Tag management
const tagSelect = document.getElementById('tag-select');
const customTag = document.getElementById('custom-tag');
const addTagBtn = document.getElementById('add-tag-btn');
const selectedTagsDiv = document.getElementById('selected-tags');
let selectedTags = [];

if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage
    render(myLeads)
}

tabBtn.addEventListener("click", function(){    
    let note = noteEl.value.trim();
    // No default note, just leave empty if not provided
    myLeads.push({ url: '', note: note, tags: [...selectedTags] })
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        myLeads[myLeads.length-1].url = tabs[0].url;
        localStorage.setItem("myLeads", JSON.stringify(myLeads) )
        render(myLeads)
        noteEl.value = ""
        selectedTags = [];
        renderSelectedTags();
    })
})

function renderSelectedTags() {
    selectedTagsDiv.innerHTML = '';
    selectedTags.forEach((tag, idx) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'badge rounded-pill px-2 py-1 me-1 mb-1';
        tagEl.style.background = '#A9B388';
        tagEl.style.color = '#5F6F52';
        tagEl.style.fontSize = '0.85em';
        tagEl.textContent = tag;
        tagEl.style.cursor = 'pointer';
        tagEl.title = 'Remove tag';
        tagEl.onclick = () => {
            selectedTags.splice(idx, 1);
            renderSelectedTags();
        };
        selectedTagsDiv.appendChild(tagEl);
    });
}

tagSelect.addEventListener('change', function() {
    const val = tagSelect.value;
    if (val && !selectedTags.includes(val)) {
        selectedTags.push(val);
        renderSelectedTags();
    }
    tagSelect.value = '';
});

addTagBtn.addEventListener('click', function() {
    const val = customTag.value.trim();
    if (val && !selectedTags.includes(val)) {
        selectedTags.push(val);
        renderSelectedTags();
    }
    customTag.value = '';
});

customTag.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addTagBtn.click();
    }
});

// Tag filter UI (dynamic, supports custom tags)
function getAllTags(leads) {
    const tagSet = new Set();
    leads.forEach(lead => {
        (lead.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
}

function renderTagFilter() {
    let tagFilterDiv = document.getElementById('tag-filter-div');
    if (!tagFilterDiv) {
        tagFilterDiv = document.createElement('div');
        tagFilterDiv.id = 'tag-filter-div';
        tagFilterDiv.className = 'mb-3 d-flex align-items-center gap-2';
        document.querySelector('.container').insertBefore(tagFilterDiv, ulEl);
    }
    const allTags = getAllTags(myLeads);
    tagFilterDiv.innerHTML = `
        <label for="tag-filter" class="form-label mb-0" style="font-weight:500;color:#5F6F52;font-size:0.95rem;">Filter by tag:</label>
        <select id="tag-filter" class="form-select form-select-sm" style="max-width:140px;">
            <option value="">All</option>
            ${allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
        </select>
    `;
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
    // Group by tags, filter if needed
    let tagGroups = {};
    leads.forEach((lead, i) => {
        let tags = lead.tags && lead.tags.length ? lead.tags : ['Untagged'];
        // Only include leads that match the filter (if set)
        if (window.activeTagFilter && !tags.includes(window.activeTagFilter)) return;
        tags.forEach(tag => {
            if (!tagGroups[tag]) tagGroups[tag] = [];
            tagGroups[tag].push({ ...lead, _idx: i });
        });
    });
    ulEl.innerHTML = '';
    if (Object.keys(tagGroups).length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'list-group-item text-center';
        emptyLi.textContent = 'No leads found for this tag.';
        ulEl.appendChild(emptyLi);
        return;
    }
    Object.keys(tagGroups).sort().forEach(tag => {
        const groupHeader = document.createElement('li');
        groupHeader.className = 'list-group-item fw-bold';
        groupHeader.style.background = '#FEFAE0';
        groupHeader.style.color = '#5F6F52';
        groupHeader.textContent = tag;
        ulEl.appendChild(groupHeader);
        tagGroups[tag].forEach(lead => {
            let url = typeof lead === 'string' ? lead : lead.url;
            let note = typeof lead === 'string' ? '' : (lead.note || '');
            let domain = '';
            try {
                domain = new URL(url).hostname;
            } catch (e) {
                domain = url;
            }
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex align-items-center justify-content-between fade-in';
            li.setAttribute('data-index', lead._idx);
            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="https://www.google.com/s2/favicons?domain=${domain}" alt="favicon" style="width:20px;height:20px;margin-right:10px;">
                    <div>
                        <a target='_blank' href='${url}'>${url}</a>
                        <div class='text-muted small note-text' data-index="${lead._idx}" tabindex="0" style="cursor:pointer;display:inline-block;min-width:40px;">${note || '<span style=\'color:#ccc\'>Click to add note</span>'}</div>
                        <div class='d-flex flex-wrap gap-1 mt-1 tag-badges' data-index="${lead._idx}">
                            ${(lead.tags||[]).map((t,tagIdx)=>`<span class='badge rounded-pill px-2 py-1 tag-badge' style='background:#A9B388;color:#5F6F52;font-size:0.8em;cursor:pointer;' data-tag-idx='${tagIdx}'>${t} <span style='font-weight:bold;cursor:pointer;' title='Remove tag'>&times;</span></span>`).join('')}
                            <button class='btn btn-sm btn-outline-success edit-tags-btn' data-index="${lead._idx}" title='Edit tags' style='padding:0 6px;font-size:0.9em;margin-left:2px;'>+</button>
                        </div>
                    </div>
                </div>
                <button class="delete-link-btn btn p-0 border-0 bg-transparent" data-index="${lead._idx}" title="Delete" style="font-size:1.25rem;line-height:1;">&times;</button>
            `;
            ulEl.appendChild(li);
        });
    });
    // Add event listeners for delete buttons
    const deleteBtns = document.querySelectorAll('.delete-link-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const li = ulEl.querySelector(`li[data-index='${idx}']`);
            if (li) {
                li.classList.remove('fade-in');
                li.classList.add('fade-out');
                setTimeout(() => {
                    myLeads.splice(idx, 1);
                    localStorage.setItem("myLeads", JSON.stringify(myLeads));
                    render(myLeads);
                }, 500);
            }
        });
    });
    // Add event listeners for editing notes
    const noteSpans = document.querySelectorAll('.note-text');
    noteSpans.forEach(span => {
        span.addEventListener('click', function(e) {
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
                localStorage.setItem("myLeads", JSON.stringify(myLeads));
                render(myLeads);
            }
            input.addEventListener('blur', saveNote);
            input.addEventListener('keydown', function(ev) {
                if (ev.key === 'Enter') {
                    input.blur();
                }
            });
        });
    });
    // Add event listeners for tag editing and removal
    const tagBadgeContainers = document.querySelectorAll('.tag-badges');
    tagBadgeContainers.forEach(container => {
        const idx = parseInt(container.getAttribute('data-index'));
        // Remove tag on click
        container.querySelectorAll('.tag-badge').forEach(badge => {
            badge.addEventListener('click', function(e) {
                const tagIdx = parseInt(badge.getAttribute('data-tag-idx'));
                if (!isNaN(tagIdx)) {
                    myLeads[idx].tags.splice(tagIdx, 1);
                    localStorage.setItem("myLeads", JSON.stringify(myLeads));
                    render(myLeads);
                    e.stopPropagation();
                }
            });
        });
        // Edit tags button
        const editBtn = container.querySelector('.edit-tags-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Remove any other open tag editors
                document.querySelectorAll('.tag-edit-inline').forEach(el => el.remove());
                // Show tag selection UI inline
                const tagInputDiv = document.createElement('div');
                tagInputDiv.className = 'd-flex flex-wrap gap-1 mt-1 tag-edit-inline';
                tagInputDiv.innerHTML = `
                    <select class='form-select form-select-sm tag-select-inline' style='max-width:120px;'>
                        <option value=''>Choose...</option>
                        <option value='New'>New</option>
                        <option value='Contacted'>Contacted</option>
                        <option value='Qualified'>Qualified</option>
                        <option value='Proposal'>Proposal</option>
                        <option value='Negotiation'>Negotiation</option>
                        <option value='Won'>Won</option>
                        <option value='Lost'>Lost</option>
                    </select>
                    <input type='text' class='form-control form-control-sm custom-tag-inline' placeholder='Add custom tag' style='max-width:120px;'>
                    <button class='btn btn-outline-success btn-sm add-tag-inline-btn'>Add</button>
                    <button class='btn btn-secondary btn-sm done-tag-edit-btn'>Done</button>
                `;
                container.parentNode.insertBefore(tagInputDiv, container.nextSibling);
                // Add tag logic
                const tagSelectInline = tagInputDiv.querySelector('.tag-select-inline');
                const customTagInline = tagInputDiv.querySelector('.custom-tag-inline');
                const addTagInlineBtn = tagInputDiv.querySelector('.add-tag-inline-btn');
                const doneTagEditBtn = tagInputDiv.querySelector('.done-tag-edit-btn');
                function addTag(val) {
                    if (val && !myLeads[idx].tags.includes(val)) {
                        myLeads[idx].tags.push(val);
                        localStorage.setItem("myLeads", JSON.stringify(myLeads));
                        render(myLeads);
                    }
                }
                tagSelectInline.addEventListener('change', function() {
                    addTag(tagSelectInline.value);
                    tagSelectInline.value = '';
                });
                addTagInlineBtn.addEventListener('click', function() {
                    addTag(customTagInline.value.trim());
                    customTagInline.value = '';
                });
                customTagInline.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        addTagInlineBtn.click();
                    }
                });
                doneTagEditBtn.addEventListener('click', function() {
                    tagInputDiv.remove();
                    render(myLeads);
                });
            });
        }
    });
}

deleteBtn.addEventListener("dblclick", function() {
    localStorage.clear()
    myLeads = []
    render(myLeads)
})

inputBtn.addEventListener("click", function() {
    const value = inputEl.value.trim();
    const note = noteEl.value.trim();
    if (value === "") {
        inputEl.classList.add("is-invalid");
        setTimeout(() => inputEl.classList.remove("is-invalid"), 2500);
        return;
    }
    if(note.length >= 200) {
        noteEl.classList.add('is-invalid');
        noteFeedback.textContent = 'Note must be less than 200 characters.';
        noteFeedback.style.display = 'block';
        setTimeout(() => {
            noteEl.classList.remove('is-invalid');
            noteFeedback.style.display = 'none';
        }, 3500);
        return;
    }
    myLeads.push({ url: value, note: note, tags: [...selectedTags] })
    inputEl.value = ""
    noteEl.value = ""
    selectedTags = [];
    renderSelectedTags();
    localStorage.setItem("myLeads", JSON.stringify(myLeads) )
    render(myLeads)
})

function exportToCSV() {
    let csv = 'URL,Note,Tags\n';
    myLeads.forEach(lead => {
        let url = typeof lead === 'string' ? lead : lead.url;
        let note = typeof lead === 'string' ? '' : (lead.note || '');
        let tags = (lead.tags||[]).join(';');
        // Escape quotes and commas
        url = '"' + url.replace(/"/g, '""') + '"';
        note = '"' + note.replace(/"/g, '""') + '"';
        tags = '"' + tags.replace(/"/g, '""') + '"';
        csv += `${url},${note},${tags}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

exportBtn.addEventListener('click', exportToCSV);

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const result = [];
    // Expect header: URL,Note,Tags
    if (!lines[0] || !/^\s*URL\s*,\s*Note(\s*,\s*Tags)?\s*$/i.test(lines[0])) {
        return null;
    }
    for (let i = 1; i < lines.length; i++) {
        // Support optional tags column (comma-separated)
        const match = lines[i].match(/^\s*"([^"]*)"\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*$/);
        if (match) {
            const tags = match[3] ? match[3].split(';').map(t => t.trim()).filter(Boolean) : [];
            result.push({ url: match[1], note: match[2], tags });
        }
    }
    return result;
}

importBtn.addEventListener('click', function() {
    importFile.value = '';
    importFile.click();
});

importFile.addEventListener('change', function() {
    importFeedback.style.display = 'none';
    const file = importFile.files[0];
    if (!file) {
        importFeedback.textContent = 'Please select a CSV file.';
        importFeedback.style.display = 'block';
        return;
    }
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        importFeedback.textContent = 'Invalid file type. Please select a .csv file.';
        importFeedback.style.display = 'block';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const parsed = parseCSV(text);
        if (!parsed) {
            importFeedback.textContent = 'Invalid CSV format. Expecting header: URL,Note';
            importFeedback.style.display = 'block';
            return;
        }
        // Add imported leads, avoiding duplicates (same url and note)
        let added = 0;
        parsed.forEach(lead => {
            if (
                lead.url &&
                !myLeads.some(l => {
                    const url = typeof l === 'string' ? l : l.url;
                    const note = typeof l === 'string' ? '' : (l.note || '');
                    return url === lead.url && note === lead.note;
                })
            ) {
                myLeads.push({ url: lead.url, note: lead.note });
                added++;
            }
        });
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        render(myLeads);
        importFeedback.textContent = `Imported ${added} new lead(s).`;
        importFeedback.style.display = 'block';
        setTimeout(() => importFeedback.style.display = 'none', 2500);
    };
    reader.readAsText(file);
});
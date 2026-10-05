function ScriptBuilder() {
    // Constructor logic here
      // Entity type dropdown behavior
        const entityTypeDropdown = document.getElementById('entity-type-dropdown');
        const entityTypeButton = document.getElementById('entity-type-button');
        const entityTypeMenu = document.getElementById('entity-type-menu');
        let selectedEntityType = 'Tenant';

        entityTypeButton.addEventListener('click', () => {
            const open = entityTypeMenu.style.display === 'block';
            entityTypeMenu.style.display = open ? 'none' : 'block';
        });

        // change text of the button and header when an entity type is selected
        entityTypeMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-entity]');
            if (!btn) return;
            selectedEntityType = btn.dataset.entity;
            entityTypeButton.textContent = selectedEntityType + ' ▾';
            document.getElementById('entity-select-header').textContent = selectedEntityType;
            entityTypeMenu.style.display = 'none';
            loadEntities(selectedEntityType);
        });

        // helper to retrieve stored RM API token
        function getRmToken() { return localStorage.getItem('rm_api_token') || (window as any).rmApiToken || ''; }

        // change options of entity list based on dropdown selection
        async function loadEntities(selectedEntityType) {
            try {
                const token = getRmToken();
                const res = await fetch(`http://localhost:3000/entities/${selectedEntityType.toLowerCase()}`, { headers: token ? { 'X-RM12Api-ApiToken': token } : {} });
                if (!res.ok) throw new Error('Server returned ' + res.status + ' ' + res.statusText);
                const entities = await res.json();
                renderEntityList(entities);
            } catch (err) {
                console.error('Error loading entities:', err);
            }
        }

        // Close type menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!entityTypeDropdown.contains(e.target)) entityTypeMenu.style.display = 'none';
        });

        // show dropdown menu when clicking the button
        function toggleDropdown() {
            const button = document.getElementById('entity-type-button');
            button.classList.toggle('active');
            const menu = document.getElementById('entity-type-menu');
            menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        }

        // SCRIPT BUILDER STUFF
        const textarea = document.getElementById('script-entry');
        function autoResize() {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
        textarea.addEventListener('input', autoResize);
        // stop enter key from submit for textarea to grow
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.stopPropagation();
            }
        });

        // SCRIPT BUILDER STUFF
        // Use button to run script and show output in the output textarea
        document.getElementById('run-btn').addEventListener('click', async () => {
            const responseArea = document.getElementById('script-output-textarea');
            const script = textarea.value;
            const entityId = selectedEntityId;
            const entityType = selectedEntityType;
            if (!entityId) {
                responseArea.textContent = 'Please select an entity before running the script.';
                return;
            }
            responseArea.textContent = 'Running...';
            try {
                console.debug('Posting script', { script, entityId, entityType });
                const token = getRmToken();
                const res = await fetch('http://localhost:3000/scriptbuilder/entity', {
                    method: 'POST',
                    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'X-RM12Api-ApiToken': token } : {}),
                    body: JSON.stringify({ script, entityId, entityType })
                });
                if (!res.ok) throw new Error('Server returned ' + res.status + ' ' + res.statusText);
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const json = await res.json();
                    responseArea.textContent = json;
                } else {
                    const text = await res.text();
                    responseArea.textContent = text;
                }
            } catch (err) {
                responseArea.textContent = 'Error processing script...';
                console.error('error sending script post request: ', err);
            }
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            textarea.value = '';
            autoResize();
            document.getElementById('script-output-textarea').textContent = '';
        });

        // Initialize size
        autoResize();

        // tenant dropdown for script testing
        // I need to change this for multiple entities
        let tenants = [];
        let selectedEntityId = null;

        // DONE: make this so it works for multiple entity types, not just tenants
        function renderEntityList(items) {
            const list = document.getElementById('entity-options');
            list.innerHTML = '';
            items.forEach(t => {
                const li = document.createElement('li');
                const entityName = t.Name ?? t.name ?? '';
                let entityId = '';
                // change ID to match the selected entity type
                switch (selectedEntityType) {
                    case 'Owners':
                        li.textContent = entityName + ' • ' + (t.OwnerID ?? t.ownerid ?? '');
                        entityId = t.OwnerID ?? t.ownerid ?? '';
                        break;
                    case 'Prospects':
                        li.textContent = entityName + ' • ' + (t.ProspectID ?? t.prospectid ?? '');
                        entityId = t.ProspectID ?? t.prospectid ?? '';
                        break;
                    case 'Properties':
                        li.textContent = entityName + ' • ' + (t.PropertyID ?? t.propertyid ?? '');
                        entityId = t.PropertyID ?? t.propertyid ?? '';
                        break;
                    default:
                        li.textContent = entityName + ' • ' + (t.TenantID ?? t.tenantid ?? '');
                        entityId = t.TenantID ?? t.tenantid ?? '';
                }
                li.addEventListener('click', () => {
                    selectedEntityId = entityId;
                    document.getElementById('entity-search').value = entityName;
                    Array.from(list.children).forEach(s => s.classList.remove('selected'));
                    li.classList.add('selected');
                    document.getElementById('selected-tenant').textContent = entityName + ' (' + entityId + ')';
                });
                list.appendChild(li);
            });
        }

        // Filter entities based on search input or textarea content
        const entitySearch = document.getElementById('entity-search');
        function filterAndRender() {
            const q = (entitySearch.value || textarea.value || '').trim().toLowerCase();
            if (!q) return renderEntityList(tenants);
            const filtered = tenants.filter(t => (t.Name ?? t.name ?? '').toLowerCase().includes(q));
            renderEntityList(filtered);
        }
        entitySearch.addEventListener('input', filterAndRender);
        textarea.addEventListener('input', filterAndRender);

        // Load entities on startup
        loadEntities('Tenants');
    return
        `<div class="main-row">
        <aside id="entity-type-selector" class="panel">
            <h2>Entity Type</h2>
            <div class="dropdown" id="entity-type-dropdown">
                <button id="entity-type-button" class="dropdown-toggle">Tenant ▾</button>
                <div id="entity-type-menu" class="dropdown-menu" style="display:none">
                    <button data-entity="Owners">Owners</button>
                    <button data-entity="Tenants">Tenants</button>
                    <button data-entity="Prospects">Prospects</button>
                    <button data-entity="Properties">Properties</button>
                </div>
            </div>
        </aside>

        <div id="scriptbuilder-container">
        <aside id="entity-select-container" class="panel">
            <h2 id="entity-select-header">Tenants</h2>
            <input id="entity-search" placeholder="Search tenants..." />
            <ul id="entity-options"></ul>
        </aside>

        <main id="script-entry-container" class="panel">
            <form id="script-form">
                <h2>Script Builder</h2>
                <textarea id="script-entry" rows="4" placeholder="Enter script here...">[Lease.Unit.Name]</textarea>
                <div class="controls">
                    <button type="button" id="run-btn" class="btn btn-primary">Test Script</button>
                    <button type="button" id="clear-btn" class="btn btn-ghost">Clear</button>
                    <div style="margin-left:auto; color:var(--muted); font-size:0.9rem">Selected: <span id="selected-tenant">None</span></div>
                </div>
            </form>
        </main>

        <section id="script-output-container" class="panel">
            <h2>Output</h2>
            <pre id="script-output-textarea">*** See Script Output here</pre>
        </section>
    </div>`
    
}
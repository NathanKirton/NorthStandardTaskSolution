// React hooks we need:
// - useState: stores values that, when changed, cause the UI to re-render
// - useEffect: runs code after the component mounts (e.g. fetching data on page load)
import { useState, useEffect } from "react";

// The base URL of the .NET API running on the azure web server.
// All fetch calls will be prefixed with this so we don't repeat it everywhere.
const API_BASE = "https://northstandardtask-e5fjhtgea0drfjad.westcentralus-01.azurewebsites.net";

// All CSS for the app is written as a plain string and injected via a <style> tag.
// This keeps everything in one file without needing a separate .css file.
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    background: #f8fafc; 
    color: #0f172a; 
    font-family: 'Inter', system-ui, sans-serif; 
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* Navbar */
  .navbar {
    background: white; 
    border-bottom: 1px solid #e2e8f0;
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .logo { 
    font-family: 'Space Grotesk', sans-serif; 
    font-size: 28px; 
    font-weight: 700; 
    letter-spacing: -1px; 
  }
  .nav-tabs {
    display: flex;
    gap: 32px;
    font-weight: 500;
  }
  .nav-tab {
    padding: 8px 0;
    cursor: pointer;
    color: #64748b;
    border-bottom: 3px solid transparent;
  }
  .nav-tab.active {
    color: #0f172a;
    border-bottom: 3px solid #0f172a;
  }

  .main { 
    flex: 1; 
    padding: 40px; 
    max-width: 1280px; 
    margin: 0 auto; 
    width: 100%; 
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .page-title { font-size: 28px; font-weight: 600; }
  .page-subtitle { color: #64748b; margin-top: 4px; font-size: 15px; }

  .btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .btn-primary {
    background: #0f172a;
    color: white;
  }
  .btn-primary:hover { background: #1e2937; transform: translateY(-1px); }

  .search-bar {
    width: 100%;
    padding: 14px 20px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    margin-bottom: 32px;
  }

  /* Cards */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 24px;
  }
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s;
  }
  .card:hover {
    border-color: #94a3b8;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
  }
  .card-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .card-subtitle {
    font-family: monospace;
    color: #64748b;
    font-size: 14px;
  }
  .card-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 24px;
  }
  .meta-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-value {
    font-weight: 500;
    margin-top: 2px;
  }

  .status {
    padding: 4px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
  }
  .status-active { background: #dcfce7; color: #166534; }
  .status-expired { background: #fee2e2; color: #b91c1c; }
  .status-inactive { background: #f1f5f9; color: #475569; }
  .status-sanctioned { background: #fef3c7; color: #92400e; }

  /* Modal */
  .modal-overlay {
    position: fixed; 
    inset: 0;
    background: rgba(15,23,42,0.75);
    display: flex; 
    align-items: center; 
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: white;
    border-radius: 12px;
    width: 480px;
    max-width: 90vw;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
  .modal-header {
    padding: 24px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title { font-size: 20px; font-weight: 600; }
  .modal-close { 
    cursor: pointer; 
    font-size: 28px; 
    color: #64748b; 
    line-height: 1; 
  }

  .modal-body { padding: 24px; }
  .form-group { margin-bottom: 20px; }
  label { 
    display: block; 
    margin-bottom: 6px; 
    font-weight: 500; 
    color: #334155; 
    font-size: 14px;
  }
  input, select {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
  }
  input:focus, select:focus { 
    outline: none; 
    border-color: #0f172a; 
  }

  .modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
`;

// Helper function that maps a vessel's status string to a CSS class name.
// This keeps the badge colouring logic in one place rather than repeated in JSX.
// Returns a class that is defined in the styles string above.
function getVesselStatusClass(status) {
    // Lowercase the status first so "Active" and "active" both match
    switch ((status || "").toLowerCase()) {
        case "active": return "status-active";      // green badge
        case "inactive": return "status-inactive";    // grey badge
        case "sanctioned": return "status-sanctioned";  // amber badge
        default: return "status-inactive";    // fallback if status is unknown
    }
}

// VesselsPage component — renders the full Vessels tab.
// Props passed in from the parent App component:
//   vessels   - the full array of vessel objects fetched from the API
//   loading   - boolean, true while the API request is in flight
//   error     - string error message, or null if everything is fine
//   onAdd     - function to call when the user clicks "+ Add Vessel"
//   onEdit    - function to call when the user clicks "Edit" on a card
//   onDelete  - function to call when the user clicks "Delete" on a card
function VesselsPage({ vessels, loading, error, onAdd, onEdit, onDelete }) {
    // Local state for the search input — only affects filtering within this component
    const [search, setSearch] = useState("");

    // Filter the vessels array every render based on the current search text.
    // Checks both the vessel name and IMO number (the API may return it as either casing).
    const filtered = vessels.filter(v =>
        (v.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.imO_Number || v.imoNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Vessels</div>
                    <div className="page-subtitle">Manage your vessel inventory</div>
                </div>
                <button className="btn btn-primary" onClick={onAdd}>+ Add Vessel</button>
            </div>

            <input
                type="text"
                className="search-bar"
                placeholder="Search by Vessel ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {error && <div style={{ color: "#ef4444", marginBottom: 16 }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading vessels...</div>
            ) : (
                <div className="cards-grid">
                    {filtered.map((v) => (
                        <div key={v.vesselId} className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div className="card-title">{v.name}</div>
                                    <div className="card-subtitle">{v.imO_Number || v.imoNumber}</div>
                                </div>
                                <span className={`status ${getVesselStatusClass(v.status)}`}>
                                    {v.status || "Unknown"}
                                </span>
                            </div>

                            <div className="card-meta">
                                <div>
                                    <div className="meta-label">Flag</div>
                                    <div className="meta-value">{v.flag}</div>
                                </div>
                                <div>
                                    <div className="meta-label">Owner</div>
                                    <div className="meta-value">{v.owner}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                                <button className="btn" style={{ flex: 1, background: "#f1f5f9", color: "#0f172a" }} onClick={() => onEdit(v)}>Edit</button>
                                <button className="btn" style={{ flex: 1, background: "#fee2e2", color: "#b91c1c" }} onClick={() => onDelete(v.vesselId)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// BluecardsPage component — renders the full Bluecards tab.
// Props are the same pattern as VesselsPage, plus:
//   bluecards - the array of bluecard objects fetched from the API
//   vessels   - needed so the "Add Bluecard" modal can show a vessel dropdown
function BluecardsPage({ bluecards, vessels, loading, error, onAdd, onEdit, onDelete }) {
    // Local search state — filters the bluecard list without affecting other tabs
    const [search, setSearch] = useState("");

    // Filter bluecards by vessel name or insurer name
    const filtered = bluecards.filter((bc) =>
        (bc.vessel?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (bc.insurer || "").toLowerCase().includes(search.toLowerCase())
    );

    // Returns true if the given date string is in the past (i.e. the bluecard has expired)
    const isExpired = (date) => date && new Date(date) < new Date();

    // Formats an ISO date string into a readable format like "1 Jan 2025"
    const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-");

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Bluecards</div>
                    <div className="page-subtitle">Manage vessel bluecards and insurance documents</div>
                </div>
                <button className="btn btn-primary" onClick={onAdd}>+ Add Bluecard</button>
            </div>

            <input
                type="text"
                className="search-bar"
                placeholder="Search by Vessel, IMO, or Insurer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {error && <div style={{ color: "#ef4444", marginBottom: 16 }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading bluecards...</div>
            ) : (
                <div className="cards-grid">
                    {filtered.map((bc) => (
                        <div key={bc.blueCardId} className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div className="card-title">{bc.vessel?.name || `Vessel ${bc.vesselId}`}</div>
                                    <div className="card-subtitle">{bc.vessel?.imO_Number || bc.vesselId}</div>
                                </div>
                                <span className={`status ${isExpired(bc.expiryDate) ? "status-expired" : "status-active"}`}>
                                    {isExpired(bc.expiryDate) ? "Expired" : "Valid"}
                                </span>
                            </div>

                            <div className="card-meta">
                                <div>
                                    <div className="meta-label">Insurer</div>
                                    <div className="meta-value">{bc.insurer}</div>
                                </div>
                                <div>
                                    <div className="meta-label">Expires</div>
                                    <div className="meta-value">{formatDate(bc.expiryDate)}</div>
                                </div>
                            </div>

                            {bc.documentUrl && (
                                <a href={bc.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#0ea5e9", marginTop: 16, display: "inline-block" }}>
                                    View PDF →
                                </a>
                            )}

                            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                                <button className="btn" style={{ flex: 1, background: "#f1f5f9" }} onClick={() => onEdit(bc)}>Edit</button>
                                <button className="btn" style={{ flex: 1, background: "#fee2e2", color: "#b91c1c" }} onClick={() => onDelete(bc.blueCardId)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// SearchPage component — lets the user search across both vessels and bluecards at once.
// Receives the full vessels and bluecards arrays so it can filter them locally
// without making extra API calls.
function SearchPage({ vessels, bluecards }) {
    // The text the user has typed into the search box
    const [term, setTerm] = useState("");

    // Build a combined results array from both vessels and bluecards.
    // We add a `type` field ("vessel" or "bluecard") so the render below
    // knows which card layout to use for each result.
    const results = [
        // Filter vessels that match the search term across name, IMO, or owner
        ...vessels
            .filter((v) => {
                if (!term) return true; // show everything when search is empty
                const searchTerm = term.toLowerCase();
                return (
                    v.name?.toLowerCase().includes(searchTerm) ||
                    v.imO_Number?.toLowerCase().includes(searchTerm) ||
                    v.imoNumber?.toLowerCase().includes(searchTerm) ||
                    v.owner?.toLowerCase().includes(searchTerm)
                );
            })
            .map((v) => ({ ...v, type: "vessel" })), // tag each result as a vessel

        // Filter bluecards that match via vessel name, IMO, insurer, or document URL
        ...bluecards
            .filter((bc) => {
                if (!term) return true;
                const searchTerm = term.toLowerCase();
                return (
                    bc.vessel?.name?.toLowerCase().includes(searchTerm) ||
                    bc.vessel?.imO_Number?.toLowerCase().includes(searchTerm) ||
                    bc.vessel?.imoNumber?.toLowerCase().includes(searchTerm) ||
                    bc.insurer?.toLowerCase().includes(searchTerm) ||
                    bc.documentUrl?.toLowerCase().includes(searchTerm)
                );
            })
            .map((bc) => ({ ...bc, type: "bluecard" })), // tag each result as a bluecard
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Search</div>
                    <div className="page-subtitle">Find vessels and bluecards</div>
                </div>
            </div>

            <div className="card" style={{ padding: "32px" }}>
                <div className="form-group">
                    <label>Search Term</label>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ marginBottom: 0 }}
                        placeholder="Enter vessel name, IMO, insurer, owner..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                </div>
            </div>

            {term && (
                <div className="cards-grid" style={{ marginTop: 32 }}>
                    {results.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#64748b", gridColumn: "1 / -1" }}>
                            No results found for "{term}"
                        </div>
                    ) : (
                        results.map((item, i) => (
                            <div key={i} className="card">
                                {item.type === "vessel" ? (
                                    <>
                                        <div className="card-title">{item.name}</div>
                                        <div className="card-subtitle">{item.imO_Number || item.imoNumber}</div>
                                        <div style={{ marginTop: 12, color: "#64748b" }}>
                                            Owner: {item.owner} • Flag: {item.flag}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="card-title">{item.vessel?.name || `Vessel ${item.vesselId}`}</div>
                                        <div className="card-subtitle">
                                            {item.vessel?.imO_Number || item.vessel?.imoNumber} • {item.insurer}
                                        </div>
                                        <div style={{ marginTop: 8 }}>
                                            Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// App is the root component — it owns all shared state and passes it down to child pages.
export default function App() {
    // Which tab is currently visible: "vessels", "bluecards", or "search"
    const [page, setPage] = useState("vessels");

    // The full list of vessels fetched from the API
    const [vessels, setVessels] = useState([]);

    // The full list of bluecards fetched from the API
    const [bluecards, setBluecards] = useState([]);

    // True while any API request is in flight — used to show loading spinners
    const [loading, setLoading] = useState(true);

    // Holds an error message string if an API call fails, otherwise null
    const [error, setError] = useState(null);

    // Controls whether the Add/Edit modal is visible
    const [showModal, setShowModal] = useState(false);

    // The item currently being edited (a vessel or bluecard object), or null when adding new
    const [editingItem, setEditingItem] = useState(null);

    // Tracks which type of modal is open: "vessel" or "bluecard"
    const [modalType, setModalType] = useState("vessel");

    // The live form field values inside the modal — updated on every keystroke
    const [form, setForm] = useState({});

    // Fetches both vessels and bluecards from the API at the same time using Promise.all.
    // Called once on mount and again after any create/update/delete to keep the UI in sync.
    const loadData = async () => {
        try {
            setLoading(true);
            // Fire both requests simultaneously rather than one after the other
            const [vRes, bRes] = await Promise.all([
                fetch(`${API_BASE}/Vessels`),
                fetch(`${API_BASE}/BlueCards`),
            ]);
            setVessels(await vRes.json());
            setBluecards(await bRes.json());
            setError(null); // clear any previous error on success
        } catch {
            setError("Failed to load data");
        } finally {
            setLoading(false); // always stop the loading spinner, even if it errored
        }
    };

    // useEffect with an empty dependency array [] means this runs once when the
    // component first mounts — the equivalent of "on page load"
    useEffect(() => {
        loadData();
    }, []);

    // Opens the modal and pre-populates the form.
    // - type: "vessel" or "bluecard" — determines which form fields are shown
    // - item: the existing object to edit, or null when creating something new
    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item); // null = "Add" mode, object = "Edit" mode

        if (type === "vessel") {
            // When editing, map the API's camelCase field names to the PascalCase keys
            // the form inputs are bound to. When adding, start with blank defaults.
            setForm(item ? {
                IMO_Number: item.imO_Number || item.imoNumber || "", // API may return either casing
                Name: item.name || "",
                Flag: item.flag || "",
                Owner: item.owner || "",
                Status: item.status || "Active",
            } : { IMO_Number: "", Name: "", Flag: "", Owner: "", Status: "Active" });
        } else {
            // For bluecards, also strip the time portion from ISO date strings
            // so the <input type="date"> receives a plain "YYYY-MM-DD" value
            setForm(item ? {
                VesselId: item.vesselId || "",
                Insurer: item.insurer || "",
                IssuedDate: item.issuedDate ? item.issuedDate.split("T")[0] : "",
                ExpiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
                DocumentUrl: item.documentUrl || "",
            } : { VesselId: "", Insurer: "", IssuedDate: "", ExpiryDate: "", DocumentUrl: "" });
        }
        setShowModal(true);
    };

    // Called when the user clicks "Save Changes" or "Add Vessel/Bluecard" in the modal.
    // Decides whether to POST (create) or PUT (update) based on whether editingItem is set.
    const handleSubmit = async () => {
        try {
            if (modalType === "vessel") {
                // If editingItem exists we're updating, so use PUT to the item's specific URL.
                // Otherwise we're creating, so POST to the collection URL.
                const url = editingItem ? `${API_BASE}/Vessels/${editingItem.vesselId}` : `${API_BASE}/Vessels`;
                const method = editingItem ? "PUT" : "POST";
                await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" }, // tell the API we're sending JSON
                    body: JSON.stringify(form), // serialise the form state to a JSON string
                });
            } else {
                // Bluecards need a bit of extra shaping before sending:
                // - VesselId must be an integer (parseInt), not a string from the select
                // - Dates must be full ISO strings (the API expects them that way)
                const body = {
                    vesselId: parseInt(form.VesselId),
                    insurer: form.Insurer,
                    issuedDate: form.IssuedDate ? new Date(form.IssuedDate).toISOString() : null,
                    expiryDate: form.ExpiryDate ? new Date(form.ExpiryDate).toISOString() : null,
                    documentUrl: form.DocumentUrl,
                };
                const url = editingItem ? `${API_BASE}/BlueCards/${editingItem.blueCardId}` : `${API_BASE}/BlueCards`;
                const method = editingItem ? "PUT" : "POST";
                await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }
            setShowModal(false); // close the modal on success
            loadData();          // re-fetch everything so the UI reflects the latest data
        } catch {
            alert("Failed to save");
        }
    };

    return (
        <>
            {/* Inject the CSS string into a <style> tag so our class names work */}
            <style>{styles}</style>
            <div className="app">

                {/* ── Navigation bar ── */}
                <nav className="navbar">
                    <div className="logo">Northstandard Interview Task</div>
                    <div className="nav-tabs">
                        {/* Clicking a tab just updates the `page` state — no routing library needed */}
                        <div className={`nav-tab ${page === "vessels" ? "active" : ""}`} onClick={() => setPage("vessels")}>Vessels</div>
                        <div className={`nav-tab ${page === "bluecards" ? "active" : ""}`} onClick={() => setPage("bluecards")}>Bluecards</div>
                        <div className={`nav-tab ${page === "search" ? "active" : ""}`} onClick={() => setPage("search")}>Search</div>
                    </div>
                </nav>

                {/* ── Page content — only the active page renders ── */}
                <main className="main">
                    {page === "vessels" && (
                        <VesselsPage
                            vessels={vessels}
                            loading={loading}
                            error={error}
                            onAdd={() => openModal("vessel")}         // no item = Add mode
                            onEdit={(v) => openModal("vessel", v)}    // item passed = Edit mode
                            onDelete={async (id) => {
                                // Ask the user to confirm before sending the DELETE request
                                if (window.confirm("Delete this vessel?")) {
                                    await fetch(`${API_BASE}/Vessels/${id}`, { method: "DELETE" });
                                    loadData(); // refresh the list after deletion
                                }
                            }}
                        />
                    )}
                    {page === "bluecards" && (
                        <BluecardsPage
                            bluecards={bluecards}
                            vessels={vessels}
                            loading={loading}
                            error={error}
                            onAdd={() => openModal("bluecard")}
                            onEdit={(b) => openModal("bluecard", b)}
                            onDelete={async (id) => {
                                if (window.confirm("Delete this bluecard?")) {
                                    await fetch(`${API_BASE}/BlueCards/${id}`, { method: "DELETE" });
                                    loadData();
                                }
                            }}
                        />
                    )}
                    {page === "search" && <SearchPage vessels={vessels} bluecards={bluecards} />}
                </main>

                {/* ── Add / Edit modal ── 
            Only rendered when showModal is true.
            Clicking the overlay background closes it; clicking inside the modal box
            stops the click from bubbling up to the overlay (e.stopPropagation). */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                {/* Title changes between "Add New" and "Edit" depending on mode */}
                                <div className="modal-title">
                                    {editingItem ? "Edit" : "Add New"} {modalType === "vessel" ? "Vessel" : "Bluecard"}
                                </div>
                                <div className="modal-close" onClick={() => setShowModal(false)}>×</div>
                            </div>

                            <div className="modal-body">
                                {/* Render vessel fields or bluecard fields depending on modalType */}
                                {modalType === "vessel" ? (
                                    <>
                                        <div className="form-group">
                                            <label>IMO Number</label>
                                            {/* Each input reads from `form` state and writes back to it on change.
                          The spread { ...form, IMO_Number: ... } keeps all other fields intact. */}
                                            <input value={form.IMO_Number || ""} onChange={(e) => setForm({ ...form, IMO_Number: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input value={form.Name || ""} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Flag</label>
                                            <input value={form.Flag || ""} onChange={(e) => setForm({ ...form, Flag: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Owner</label>
                                            <input value={form.Owner || ""} onChange={(e) => setForm({ ...form, Owner: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select value={form.Status || "Active"} onChange={(e) => setForm({ ...form, Status: e.target.value })}>
                                                <option>Active</option>
                                                <option>Inactive</option>
                                                <option>Sanctioned</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Vessel</label>
                                            {/* Dropdown populated from the vessels array so the user picks a real vessel */}
                                            <select value={form.VesselId || ""} onChange={(e) => setForm({ ...form, VesselId: e.target.value })}>
                                                <option value="">Select a vessel</option>
                                                {vessels.map((v) => (
                                                    <option key={v.vesselId} value={v.vesselId}>
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Insurer</label>
                                            <input value={form.Insurer || ""} onChange={(e) => setForm({ ...form, Insurer: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Issued Date</label>
                                            {/* type="date" renders a native date picker; value must be "YYYY-MM-DD" */}
                                            <input type="date" value={form.IssuedDate || ""} onChange={(e) => setForm({ ...form, IssuedDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input type="date" value={form.ExpiryDate || ""} onChange={(e) => setForm({ ...form, ExpiryDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Document URL</label>
                                            <input value={form.DocumentUrl || ""} onChange={(e) => setForm({ ...form, DocumentUrl: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button className="btn" style={{ background: "#f1f5f9", color: "#0f172a" }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                {/* handleSubmit figures out POST vs PUT internally */}
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    {editingItem ? "Save Changes" : `Add ${modalType === "vessel" ? "Vessel" : "Bluecard"}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
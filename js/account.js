(function () {
  "use strict";

  var DOC_TYPES = [
    { key: "registration_proof", label: "Proof of team registration", hint: "FIRST registration confirmation, roster export, etc." },
    { key: "budget_plan", label: "Budget & season plan (PDF)", hint: "Your team's budgeting and season plan document." },
    { key: "tax_exempt_proof", label: "501(c)(3) / tax-exempt proof", hint: "IRS determination letter, or your school's tax-exempt letter." },
  ];

  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    document.getElementById("config-warning").hidden = false;
    return;
  }

  var sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  document.getElementById("app").hidden = false;

  var currentUser = null;

  var authError = document.getElementById("auth-error");

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }

  document.getElementById("google-signin-btn").addEventListener("click", async function () {
    showError(authError, "");
    var { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) showError(authError, error.message);
  });

  document.getElementById("signout-btn").addEventListener("click", async function () {
    await sb.auth.signOut();
  });

  document.getElementById("profile-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var profileInfo = document.getElementById("profile-info");
    showError(profileInfo, "");
    var teamNumber = document.getElementById("team-number-input").value.trim();
    var contactEmail = document.getElementById("contact-email-input").value.trim();

    var { error } = await sb.from("teams").upsert({
      id: currentUser.id,
      team_number: teamNumber,
      contact_email: contactEmail,
      updated_at: new Date().toISOString(),
    });
    if (error) return showError(profileInfo, error.message);
    showError(profileInfo, "Saved.");
  });

  function renderDocList(existingDocs) {
    var container = document.getElementById("doc-list");
    container.innerHTML = "";
    DOC_TYPES.forEach(function (dt) {
      var match = existingDocs
        .filter(function (d) { return d.doc_type === dt.key; })
        .sort(function (a, b) { return new Date(b.uploaded_at) - new Date(a.uploaded_at); })[0];

      var row = document.createElement("div");
      row.className = "doc-row";

      var info = document.createElement("div");
      info.className = "doc-info";
      var title = document.createElement("b");
      title.textContent = dt.label;
      var sub = document.createElement("span");
      sub.textContent = match ? "Uploaded: " + (match.original_filename || "file") : dt.hint;
      info.appendChild(title);
      info.appendChild(sub);

      var actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.alignItems = "center";
      actions.style.gap = "10px";

      var status = document.createElement("span");
      status.className = "doc-status " + (match ? "uploaded" : "missing");
      status.textContent = match ? "Uploaded" : "Missing";

      var btn = document.createElement("button");
      btn.className = "file-btn";
      btn.type = "button";
      btn.textContent = match ? "Replace" : "Upload";

      var input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png";
      input.style.display = "none";
      input.addEventListener("change", function () {
        if (input.files && input.files[0]) uploadDoc(dt.key, input.files[0]);
      });

      btn.addEventListener("click", function () { input.click(); });

      actions.appendChild(status);
      actions.appendChild(btn);
      actions.appendChild(input);

      row.appendChild(info);
      row.appendChild(actions);
      container.appendChild(row);
    });
  }

  async function loadDashboard() {
    var { data: team } = await sb.from("teams").select("*").eq("id", currentUser.id).maybeSingle();
    if (team) {
      document.getElementById("team-number-input").value = team.team_number || "";
      document.getElementById("contact-email-input").value = team.contact_email || currentUser.email || "";
    } else {
      document.getElementById("contact-email-input").value = currentUser.email || "";
    }

    var { data: docs, error: docErr } = await sb
      .from("team_documents")
      .select("*")
      .eq("team_id", currentUser.id);
    renderDocList(docErr ? [] : docs || []);
  }

  async function uploadDoc(docType, file) {
    if (file.size > 10 * 1024 * 1024) {
      alert("File is larger than 10MB — please use a smaller file.");
      return;
    }
    var path = currentUser.id + "/" + docType + "-" + Date.now() + "-" + file.name;
    var { error: uploadErr } = await sb.storage.from("team-documents").upload(path, file);
    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      return;
    }
    var { error: insertErr } = await sb.from("team_documents").insert({
      team_id: currentUser.id,
      doc_type: docType,
      storage_path: path,
      original_filename: file.name,
    });
    if (insertErr) {
      alert("Saved the file but failed to record it: " + insertErr.message);
      return;
    }
    loadDashboard();
  }

  function showAuthed() {
    document.getElementById("auth-section").hidden = true;
    document.getElementById("dashboard-section").hidden = false;
    loadDashboard();
  }

  function showSignedOut() {
    document.getElementById("auth-section").hidden = false;
    document.getElementById("dashboard-section").hidden = true;
  }

  sb.auth.onAuthStateChange(function (_event, session) {
    currentUser = session ? session.user : null;
    if (currentUser) showAuthed();
    else showSignedOut();
  });

  sb.auth.getSession().then(function (res) {
    currentUser = res.data.session ? res.data.session.user : null;
    if (currentUser) showAuthed();
    else showSignedOut();
  });
})();

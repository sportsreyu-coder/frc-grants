(function () {
  "use strict";

  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    document.getElementById("config-warning").hidden = false;
    return;
  }

  var sb = window.__frcHubSupabase || window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
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

  var districtSelect = document.getElementById("profile-district");
  (window.FRC_DISTRICTS || []).forEach(function (d) {
    var opt = document.createElement("option");
    opt.value = d.value;
    opt.textContent = d.label;
    districtSelect.appendChild(opt);
  });

  document.getElementById("profile-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var profileInfo = document.getElementById("profile-info");
    showError(profileInfo, "");
    var teamNumber = document.getElementById("profile-team-number").value.trim();
    var teamName = document.getElementById("profile-team-name").value.trim();
    var district = districtSelect.value;

    var { error } = await sb.from("profiles").upsert({
      id: currentUser.id,
      team_number: teamNumber,
      team_name: teamName || null,
      district: district || null,
      updated_at: new Date().toISOString(),
    });
    if (error) return showError(profileInfo, error.message);
    profileInfo.textContent = "Saved.";
    profileInfo.style.display = "block";
  });

  async function loadProfile() {
    var { data: profile } = await sb.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
    if (profile) {
      document.getElementById("profile-team-number").value = profile.team_number || "";
      document.getElementById("profile-team-name").value = profile.team_name || "";
      districtSelect.value = profile.district || "";
    }
  }

  function showAuthed() {
    document.getElementById("auth-section").hidden = true;
    document.getElementById("dashboard-section").hidden = false;
    document.getElementById("signed-in-email").textContent = currentUser.email || "";
    loadProfile();
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

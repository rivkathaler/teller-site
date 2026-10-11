/* ------------------------------------------------------------------
   Sign-up form ("Keep me posted") → your Mailchimp audience.

   Set on <form id="signup">:
     data-mailchimp="https://YOURDC.list-manage.com/subscribe/post?u=…&id=…"
          = the action="" address from Mailchimp's embedded form
     data-mailchimp-tags="12345"   (optional) = tag id(s) to add, e.g. "coming soon"

   Name → Mailchimp FNAME, email → EMAIL. No keys or passwords live on the site.
   (Optional fallback: data-endpoint="https://…" POSTs { name, email } as JSON.)
   While neither is set, NOTHING is sent and the form says so.
   ------------------------------------------------------------------ */
(function () {
  var form = document.getElementById("signup");
  if (!form) return;
  var email = form.elements.email, name = form.elements.name;
  var btn = form.querySelector(".btn");
  var status = document.getElementById("su-status");

  function say(msg, isError) {
    status.textContent = msg;
    status.classList.toggle("error", !!isError);
  }
  function done() { btn.disabled = false; }
  email.addEventListener("input", function () { email.classList.remove("invalid"); });

  // Mailchimp's "post-json" address answers with JSONP, which works from any static site.
  function mailchimp(action, tags, cb) {
    var u = new URL(action, location.href);
    var uid = u.searchParams.get("u"), id = u.searchParams.get("id");
    if (!uid || !id) { cb(new Error("bad action url")); return; }
    var q = new URLSearchParams();
    q.set("u", uid); q.set("id", id);
    if (u.searchParams.get("f_id")) q.set("f_id", u.searchParams.get("f_id"));
    q.set("EMAIL", email.value.trim());
    q.set("FNAME", name.value.trim());
    if (tags) q.set("tags", tags);
    q.set("b_" + uid + "_" + id, "");          // Mailchimp's anti-bot field — must stay empty
    var cbName = "mc_cb_" + Date.now(), s = document.createElement("script"), t;
    function cleanup() { clearTimeout(t); delete window[cbName]; s.remove(); }
    window[cbName] = function (d) { cleanup(); cb(null, d); };
    s.onerror = function () { cleanup(); cb(new Error("network")); };
    t = setTimeout(function () { cleanup(); cb(new Error("timeout")); }, 12000);
    s.src = u.origin + u.pathname.replace("/subscribe/post", "/subscribe/post-json") + "?" + q.toString() + "&c=" + cbName;
    document.head.appendChild(s);
  }

  function friendly(msg) {
    var m = String(msg || "").replace(/<[^>]*>/g, "").replace(/^\s*\d+\s*-\s*/, "").trim();
    if (/already subscribed/i.test(m)) return "You’re already on the list — thank you!";
    if (/too many|recent|limit/i.test(m)) return "Please try again in a minute.";
    if (/valid email|invalid/i.test(m)) return "Please enter a valid email.";
    return "Something went wrong. Please try again.";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      email.classList.add("invalid");
      say("Please enter a valid email.", true);
      email.focus();
      return;
    }
    var mc = form.getAttribute("data-mailchimp");
    var endpoint = form.getAttribute("data-endpoint");
    if (!mc && !endpoint) {
      say("Sign-up isn’t connected yet.", true);
      console.warn("[Teller] data-mailchimp is empty — nothing was sent.");
      return;
    }
    btn.disabled = true;
    say("Sending…");

    if (mc) {
      mailchimp(mc, form.getAttribute("data-mailchimp-tags"), function (err, d) {
        if (err) say("Something went wrong. Please try again.", true);
        else if (d && d.result === "success") { form.reset(); say("Thank you — you’re on the list."); }
        else say(friendly(d && d.msg), true);
        done();
      });
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ name: name.value.trim(), email: value })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      form.reset();
      say("Thank you — you’re on the list.");
    }).catch(function () {
      say("Something went wrong. Please try again.", true);
    }).then(done);
  });
})();

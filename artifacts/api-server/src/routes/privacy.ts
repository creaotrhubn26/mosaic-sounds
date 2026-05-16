import { Router } from "express";

const router = Router();

router.get("/privacy", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — Mosaic Beats</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0F0708; color: #FAF0E6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px 24px; max-width: 720px; margin: 0 auto; line-height: 1.7; }
    h1 { color: #D4A017; font-size: 28px; margin-bottom: 8px; }
    .sub { color: #6B5F5A; font-size: 13px; margin-bottom: 36px; }
    h2 { color: #C8102E; font-size: 17px; margin: 28px 0 10px; }
    p { color: #d4c5b5; font-size: 15px; margin-bottom: 12px; }
    ul { color: #d4c5b5; font-size: 15px; padding-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    a { color: #D4A017; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #1A0B0C; color: #6B5F5A; font-size: 13px; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="sub">Mosaic Beats · Last updated: January 2025</p>

  <h2>1. Information We Collect</h2>
  <p>Mosaic Beats collects the following information to provide its services:</p>
  <ul>
    <li><strong>Account information</strong>: Email address and name when you sign in with Google.</li>
    <li><strong>Music preferences</strong>: Cultural background, event type, vibe preferences, and playlist sets you create — stored locally and optionally synced to our servers.</li>
    <li><strong>Usage data</strong>: Anonymized app usage patterns to improve recommendations.</li>
    <li><strong>Device token</strong>: A push notification token to deliver guest song requests to you.</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To generate personalized song recommendations based on your cultures and event type.</li>
    <li>To sync your playlists across devices when you are signed in.</li>
    <li>To deliver guest song request notifications during your event.</li>
    <li>To improve the app through anonymized analytics.</li>
  </ul>

  <h2>3. Data Storage</h2>
  <p>Your playlist data is stored locally on your device using AsyncStorage. When signed in, your data is also synced to our secure servers. You can delete all synced data at any time from Settings → Account → Delete Account.</p>

  <h2>4. Third-Party Services</h2>
  <ul>
    <li><strong>RevenueCat</strong>: Manages in-app subscriptions. See <a href="https://www.revenuecat.com/privacy">RevenueCat Privacy Policy</a>.</li>
    <li><strong>YouTube</strong>: Song previews are loaded from YouTube. See <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</li>
    <li><strong>Expo / EAS</strong>: Push notification delivery infrastructure.</li>
  </ul>

  <h2>5. Your Rights</h2>
  <p>You may request deletion of your account and all associated data by emailing <a href="mailto:support@mosaicbeats.app">support@mosaicbeats.app</a> or using the delete option in Settings.</p>

  <h2>6. Children</h2>
  <p>Mosaic Beats is not directed at children under 13. We do not knowingly collect personal information from children.</p>

  <h2>7. Contact</h2>
  <p>For privacy questions: <a href="mailto:support@mosaicbeats.app">support@mosaicbeats.app</a></p>

  <div class="footer">© 2025 Mosaic Beats. All rights reserved.</div>
</body>
</html>`);
});

router.get("/terms", (_req, res) => {
  res.redirect("/privacy");
});

export default router;

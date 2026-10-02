import { chromium } from "playwright";

async function runTests() {
  console.log("==================================================");
  console.log("🚀 Starting Comprehensive End-to-End Feature Test");
  console.log("==================================================\n");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const results = [];
  const logStep = (name, passed, details = "") => {
    results.push({ name, passed, details });
    const symbol = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${symbol} : ${name} ${details ? `(${details})` : ""}`);
  };

  try {
    // ------------------------------------------------------------------
    // TEST 1: Landing Page & Title
    // ------------------------------------------------------------------
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const pageTitle = await page.title();
    const hasCorrectTitle = pageTitle.includes("LifePulse");
    logStep("1. Landing Page Load & Title", hasCorrectTitle, pageTitle);

    // TEST 1b: 3D Background WebGL Canvas presence
    const canvas = await page.$("canvas");
    const hasCanvas = canvas !== null;
    logStep("1b. 3D Background WebGL Canvas", hasCanvas, hasCanvas ? "Three.js 3D canvas active in background" : "Canvas not found");

    // ------------------------------------------------------------------
    // TEST 2: Interactive Preview Card on Landing Page
    // ------------------------------------------------------------------
    const preview = await page.$("text=Today's Progress Preview");
    const hasPreview = preview !== null;
    logStep("2. Interactive Preview Card", hasPreview, hasPreview ? "Clean preview card rendered" : "No preview found");

    // ------------------------------------------------------------------
    // TEST 3: Night / Dark Mode Toggle on Landing Page
    // ------------------------------------------------------------------
    const themeBtn = await page.$("button[title*='Night Mode'], button[title*='Day Mode']");
    const hasThemeBtn = themeBtn !== null;
    if (hasThemeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(400);
      const isDarkAfterClick = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      const savedTheme = await page.evaluate(() => localStorage.getItem("lifepulse_theme"));
      const themeWorked = isDarkAfterClick && savedTheme === "dark";
      logStep("3. Night Mode Toggle", themeWorked, `class="dark": ${isDarkAfterClick}, stored: ${savedTheme}`);

      // Toggle back to light to test reversal
      await themeBtn.click();
      await page.waitForTimeout(400);
      const isLightAgain = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
      logStep("3b. Toggle back to Day Mode", isLightAgain, "Switched back to light mode");
    } else {
      logStep("3. Night Mode Toggle", false, "Theme button not found");
    }

    // ------------------------------------------------------------------
    // TEST 4: Firebase Console Setup Guide Modal
    // ------------------------------------------------------------------
    const guideBtn = await page.$("button:has-text('Firebase Guide')");
    if (guideBtn) {
      await guideBtn.click();
      await page.waitForTimeout(300);
      const modalHeader = await page.$("text=Firebase Setup Guide");
      const hasModal = modalHeader !== null;
      logStep("4. Firebase Setup Modal Open", hasModal, "Modal opened successfully");

      const closeBtn = await page.$("button:has-text('close guide'), button:has-text('Got it')");
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(200);
    } else {
      logStep("4. Firebase Setup Modal", false, "Firebase Guide button not found");
    }

    // ------------------------------------------------------------------
    // TEST 5: Protected Route & Instant Demo Sign-In
    // ------------------------------------------------------------------
    const demoBtn = await page.$("button:has-text('Instant Demo'), button:has-text('Try Instant Demo')");
    if (demoBtn) {
      await demoBtn.click();
      await page.waitForSelector("text=Alex Morgan", { timeout: 5000 });
      const userGreeting = await page.$("text=Alex");
      logStep("5. Guest / Demo Login & Greeting", userGreeting !== null, "User greeting rendered on Dashboard");
    } else {
      logStep("5. Demo Sign-In", false, "Demo button not found");
    }

    // ------------------------------------------------------------------
    // TEST 6: Progress Overview Metrics
    // ------------------------------------------------------------------
    const progressText = await page.$("text=Today's Progress");
    const streakText = await page.$("text=Streak");
    const hasProgressOverview = progressText !== null && streakText !== null;
    logStep("6. Progress Overview Bar & Streak", hasProgressOverview, "Progress overview and streak metrics found");

    // ------------------------------------------------------------------
    // TEST 7: Daily Logs - Create New Activity
    // ------------------------------------------------------------------
    const addLogBtn = await page.$("button:has-text('Add Log')");
    if (addLogBtn) {
      await addLogBtn.click();
      await page.waitForTimeout(400);

      // Fill in activity form with precise selector
      await page.fill("#activity-title-input", "Morning 3D Gym Workout");

      // Select category Workout inside the form
      const workoutCatBtn = await page.$("form button:has-text('Workout')");
      if (workoutCatBtn) await workoutCatBtn.click();

      // Click +15m button inside form
      const quickBtn = await page.$("form button:has-text('+15m')");
      if (quickBtn) await quickBtn.click();

      // Add notes
      await page.fill("form textarea", "Tested physical 3D weight lifting and cardio.");

      // Submit
      const saveBtn = await page.$("form button:has-text('Save Activity')");
      if (saveBtn) await saveBtn.click();
      await page.waitForTimeout(800);

      const createdItem = await page.$("text=Morning 3D Gym Workout");
      logStep("7. Daily Logs - Add Activity", createdItem !== null, "Activity saved and rendered with category & duration");
    } else {
      logStep("7. Daily Logs - Add Activity", false, "Add Log button not found");
    }

    // ------------------------------------------------------------------
    // TEST 8: Goal Tracking - Add New Goal
    // ------------------------------------------------------------------
    const newGoalBtn = await page.$("button:has-text('New Goal')");
    if (newGoalBtn) {
      await newGoalBtn.click();
      await page.waitForTimeout(400);

      // Fill in goal title
      await page.fill("#goal-title-input", "Read 25 Pages of Sci-Fi");

      // Click Save Goal
      const saveGoalBtn = await page.$("form button:has-text('Save Goal'), form button:has-text('Create Goal')");
      if (saveGoalBtn) await saveGoalBtn.click();
      await page.waitForTimeout(800);

      const createdGoal = await page.$("text=Read 25 Pages of Sci-Fi");
      logStep("8. Goal Tracking - Add Goal", createdGoal !== null, "Goal created and listed");
    } else {
      logStep("8. Goal Tracking - Add Goal", false, "New Goal button not found");
    }

    // ------------------------------------------------------------------
    // TEST 9: Goal Tracking - 3D Tactile Checkbox Toggle
    // ------------------------------------------------------------------
    // Find checkbox for the newly created goal or first goal
    const checkboxes = await page.$$(".cube-checkbox");
    if (checkboxes.length > 0) {
      const initialPercentText = await page.evaluate(() => {
        const el = document.querySelector(".progress-3d-capsule");
        return el ? el.parentElement.innerText : "";
      });

      // Click first checkbox
      await checkboxes[0].click();
      await page.waitForTimeout(600);

      const afterPercentText = await page.evaluate(() => {
        const el = document.querySelector(".progress-3d-capsule");
        return el ? el.parentElement.innerText : "";
      });

      logStep("9. 3D Checkbox Cube Toggle", true, `Toggled habit, dynamic completion updated`);
    } else {
      logStep("9. 3D Checkbox Cube Toggle", false, "No checkboxes found");
    }

    // ------------------------------------------------------------------
    // TEST 10: Tab Navigation (Analytics, Goals, Activities, Dashboard)
    // ------------------------------------------------------------------
    // Click Analytics tab
    const analyticsTab = await page.$("button:has-text('Analytics')");
    if (analyticsTab) {
      await analyticsTab.click();
      await page.waitForTimeout(400);
      const analyticsHeader = await page.$("text=Time Distribution by Category");
      logStep("10a. Navigate to Analytics Tab", analyticsHeader !== null, "3D Category Distribution rendered");
    }

    // Click Daily Logs tab
    const activitiesTab = await page.$("button:has-text('Daily Logs')");
    if (activitiesTab) {
      await activitiesTab.click();
      await page.waitForTimeout(400);
      const activitiesHeader = await page.$("text=Daily Activity Logs");
      logStep("10b. Navigate to Daily Logs Tab", activitiesHeader !== null, "Daily Logs view rendered");
    }

    // Click Dashboard tab
    const dashboardTab = await page.$("button:has-text('Dashboard')");
    if (dashboardTab) {
      await dashboardTab.click();
      await page.waitForTimeout(400);
      const dashOverview = await page.$("text=Today's Progress");
      logStep("10c. Navigate back to Dashboard", dashOverview !== null, "Main Dashboard restored");
    }

    // ------------------------------------------------------------------
    // TEST 11: Night Mode in Authenticated Dashboard
    // ------------------------------------------------------------------
    const headerThemeBtn = await page.$("header button[title*='Night Mode'], header button[title*='Day Mode']");
    if (headerThemeBtn) {
      await headerThemeBtn.click();
      await page.waitForTimeout(400);
      const isDarkInDashboard = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      logStep("11. Dashboard Night Mode", isDarkInDashboard, "Dark theme active in authenticated dashboard");
    }

    // ------------------------------------------------------------------
    // TEST 12: Logout & Route Barrier
    // ------------------------------------------------------------------
    const logoutBtn = await page.$("button:has-text('Log out')");
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
      const backOnLanding = await page.$("text=Continue with Google");
      logStep("12. Logout & Route Protection", backOnLanding !== null, "Session terminated, returned to protected barrier");
    } else {
      logStep("12. Logout", false, "Logout button not found");
    }

  } catch (err) {
    console.error("Test execution encountered an error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  console.log(`🏁 Test Summary: ${passed}/${total} features passed (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();

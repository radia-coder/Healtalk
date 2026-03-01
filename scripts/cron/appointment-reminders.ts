const args = process.argv.slice(2);
const windowArgIndex = args.findIndex((arg) => arg === "--window");
const windowInline = args.find((arg) => arg.startsWith("--window="));

let windowValue = "all";
if (windowInline) {
  windowValue = windowInline.split("=")[1] || "all";
} else if (windowArgIndex >= 0) {
  windowValue = args[windowArgIndex + 1] || "all";
}

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

const url = `${baseUrl.replace(/\/$/, "")}/api/notifications/appointments/reminders?window=${windowValue}`;

const headers: Record<string, string> = {
  "Content-Type": "application/json",
};

if (process.env.CRON_SECRET) {
  headers["x-cron-secret"] = process.env.CRON_SECRET;
}

(async () => {
  try {
    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Reminder cron failed:", res.status, data);
      process.exit(1);
    }

    console.log("Reminder cron success:", data);
  } catch (error) {
    console.error("Reminder cron error:", error);
    process.exit(1);
  }
})();

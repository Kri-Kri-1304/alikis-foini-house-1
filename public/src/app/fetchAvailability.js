// src/app/fetchAvailability.js
// PUBLIC Google Calendar read

// src/app/fetchAvailability.js
export async function fetchEvents({ calendarId, apiKey, timeMin, timeMax }) {
  const url = new URL(
    'https://www.googleapis.com/calendar/v3/calendars/' +
    encodeURIComponent(calendarId) +
    '/events'
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('singleEvents', 'true');  // expand recurring
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('timeMin', new Date(timeMin).toISOString());
  url.searchParams.set('timeMax', new Date(timeMax).toISOString());

  console.log('🔎 fetchEvents params:', {
    calendarId,
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
    url: url.toString()
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Calendar fetch failed: ' + res.status);
  const data = await res.json();

  console.log('🗂️ raw events items:', data.items?.length ?? 0, data.items);
  return data.items || [];
}

// (keep your hasConflict with logging as we added earlier)


// All‑day events use end.date as the next day (exclusive).
// We treat all‑day as full‑day inclusive and compare by "nights".
export function hasConflict({ events, checkin, checkout }) {
  const ci = typeof checkin === 'string' ? checkin : checkin.toISOString().slice(0, 10);
  const co = typeof checkout === 'string' ? checkout : checkout.toISOString().slice(0, 10);

  console.log("🔍 Checking conflicts:");
  console.log("   Requested:", ci, "→", co);
  console.log("   Events:", events.length);

  return events.some(ev => {
    console.log("\n📅 Event:", ev.summary || "(no title)");

    if (ev.start?.date && ev.end?.date) {
      const es = ev.start.date;
      const ee = ev.end.date;
      console.log("   Type: All-day");
      console.log("   Event range (inclusive → exclusive):", es, "→", ee);

      const overlap = !(co <= es || ci >= ee);
      console.log("   Overlap?", overlap);
      return overlap;
    }

    if (ev.start?.dateTime && ev.end?.dateTime) {
      const evStart = new Date(ev.start.dateTime).getTime();
      const evEnd = new Date(ev.end.dateTime).getTime();
      const reqStart = new Date(ci + "T00:00:00").getTime();
      const reqEnd = new Date(co + "T00:00:00").getTime();

      console.log("   Type: Timed");
      console.log("   Event start:", ev.start.dateTime);
      console.log("   Event end:", ev.end.dateTime);
      console.log("   Request start:", new Date(reqStart).toISOString());
      console.log("   Request end:", new Date(reqEnd).toISOString());

      const overlap = Math.max(reqStart, evStart) < Math.min(reqEnd, evEnd);
      console.log("   Overlap?", overlap);
      return overlap;
    }

    console.log("⚠️ Unknown event format, skipping.");
    return false;
  });
}



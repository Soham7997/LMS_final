export {};

/**
 * Creates a Google Calendar event with Google Meet and returns the Meet link.
 *
 * IMPORTANT: Google does NOT allow creating Calendar events with conferenceData
 * (Google Meet links) using only an API key. You MUST use OAuth2 or a
 * service account with Calendar write access.
 *
 * Env options:
 *   - GOOGLE_APPLICATION_CREDENTIALS - path to service account JSON
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY - inline service account
 *   - GOOGLE_CALENDAR_ID (optional, default 'primary')
 *   - GOOGLE_MEET_TIMEZONE (optional, default 'Asia/Tokyo')
 */

const { google } = require('googleapis');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const DEFAULT_TIMEZONE = process.env.GOOGLE_MEET_TIMEZONE || 'Asia/Tokyo';

function getAuthClient() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) {
    return null;
  }
  const privateKey = key.replace(/\\n/g, '\n');
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey
    },
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
}

/**
 * Create a calendar event with Google Meet and return the Meet link.
 * @param title - Event title
 * @param description - Optional description
 * @param startDateTime - ISO datetime string (e.g. 2025-02-15T14:30:00)
 * @param endDateTime - ISO datetime string (e.g. 2025-02-15T15:30:00)
 * @returns Meet URL or null if generation fails
 */
async function createMeetLink(
  title: string,
  description: string | undefined,
  startDateTime: string,
  endDateTime: string
): Promise<string | null> {
  const auth = getAuthClient();
  if (!auth) {
    console.warn(
      'Google Calendar: no credentials configured. ' +
        'To auto-create Google Meet links, set GOOGLE_APPLICATION_CREDENTIALS ' +
        'or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.'
    );
    return null;
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/75a258f2-8154-4e5f-8113-4ad1cbb1c307', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'src/services/googleCalendar.ts:createMeetLink',
      message: 'createMeetLink entry',
      data: {
        title,
        hasDescription: !!description,
        startDateTime,
        endDateTime,
        authType: typeof auth === 'string' ? 'apiKey' : 'googleAuth',
        calendarId: CALENDAR_ID
      },
      timestamp: Date.now(),
      runId: 'pre-fix',
      hypothesisId: 'H1'
    })
  }).catch(() => {});
  // #endregion

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const requestId = `lms-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const event = {
      summary: title,
      description: description || undefined,
      start: {
        dateTime: startDateTime,
        timeZone: DEFAULT_TIMEZONE
      },
      end: {
        dateTime: endDateTime,
        timeZone: DEFAULT_TIMEZONE
      },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/75a258f2-8154-4e5f-8113-4ad1cbb1c307', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/services/googleCalendar.ts:createMeetLink',
        message: 'createMeetLink before events.insert',
        data: {
          requestId,
          calendarId: CALENDAR_ID
        },
        timestamp: Date.now(),
        runId: 'pre-fix',
        hypothesisId: 'H2'
      })
    }).catch(() => {});
    // #endregion

    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      conferenceDataVersion: 1,
      requestBody: event
    });

    const entryPoints = res.data?.conferenceData?.entryPoints;
    if (entryPoints && Array.isArray(entryPoints)) {
      const video = entryPoints.find((ep: any) => ep.entryPointType === 'video' || ep.entryPointType === 'more');
      const uri = video?.uri || entryPoints[0]?.uri;
      if (uri) return uri;
    }
    return null;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/75a258f2-8154-4e5f-8113-4ad1cbb1c307', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/services/googleCalendar.ts:createMeetLink',
        message: 'createMeetLink error',
        data: {
          errorName: (err as any)?.name,
          errorMessage: (err as any)?.message
        },
        timestamp: Date.now(),
        runId: 'pre-fix',
        hypothesisId: 'H3'
      })
    }).catch(() => {});
    // #endregion

    console.error('Google Calendar create event error:', err);
    return null;
  }
}

module.exports = { createMeetLink };

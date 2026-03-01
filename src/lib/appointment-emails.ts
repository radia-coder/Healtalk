type AppointmentEmailPayload = {
  patientName: string;
  psychologistName: string;
  startTime: Date;
  endTime: Date;
  type: string;
  appUrl?: string;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);

const formatTime = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

const formatType = (value: string) => value.replace(/_/g, " ");

const buildDetails = (payload: AppointmentEmailPayload) => {
  const date = formatDate(payload.startTime);
  const time = `${formatTime(payload.startTime)} - ${formatTime(payload.endTime)}`;
  return {
    date,
    time,
    type: formatType(payload.type),
    appUrl: payload.appUrl,
  };
};

const buildFooter = (appUrl?: string) =>
  appUrl
    ? `<p style="margin-top:24px;">Manage your appointment: <a href="${appUrl}">${appUrl}</a></p>`
    : "";

export const appointmentConfirmationEmail = (payload: AppointmentEmailPayload) => {
  const details = buildDetails(payload);
  return {
    subject: "Your HealTalk appointment is confirmed",
    text: `Your appointment is confirmed.\nDate: ${details.date}\nTime: ${details.time}\nType: ${details.type}\nPsychologist: ${payload.psychologistName}\nPatient: ${payload.patientName}\n${details.appUrl ? `Manage: ${details.appUrl}` : ""}`,
    html: `
      <h2>Appointment confirmed</h2>
      <p>Your appointment is scheduled.</p>
      <ul>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Type:</strong> ${details.type}</li>
        <li><strong>Psychologist:</strong> ${payload.psychologistName}</li>
        <li><strong>Patient:</strong> ${payload.patientName}</li>
      </ul>
      ${buildFooter(details.appUrl)}
    `,
  };
};

export const appointmentReminderEmail = (
  payload: AppointmentEmailPayload,
  windowLabel: "24h" | "1h"
) => {
  const details = buildDetails(payload);
  const subjectPrefix = windowLabel === "1h" ? "Starting soon" : "Reminder";
  return {
    subject: `${subjectPrefix}: HealTalk appointment ${windowLabel === "1h" ? "in 1 hour" : "in 24 hours"}`,
    text: `Appointment reminder (${windowLabel}).\nDate: ${details.date}\nTime: ${details.time}\nType: ${details.type}\nPsychologist: ${payload.psychologistName}\nPatient: ${payload.patientName}\n${details.appUrl ? `Manage: ${details.appUrl}` : ""}`,
    html: `
      <h2>${subjectPrefix}: appointment ${windowLabel === "1h" ? "in 1 hour" : "in 24 hours"}</h2>
      <p>This is a reminder for your upcoming appointment.</p>
      <ul>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Type:</strong> ${details.type}</li>
        <li><strong>Psychologist:</strong> ${payload.psychologistName}</li>
        <li><strong>Patient:</strong> ${payload.patientName}</li>
      </ul>
      ${buildFooter(details.appUrl)}
    `,
  };
};

export const appointmentCancellationEmail = (payload: AppointmentEmailPayload) => {
  const details = buildDetails(payload);
  return {
    subject: "Appointment cancelled",
    text: `Your appointment has been cancelled.\nDate: ${details.date}\nTime: ${details.time}\nType: ${details.type}\nPsychologist: ${payload.psychologistName}\nPatient: ${payload.patientName}\n${details.appUrl ? `Manage: ${details.appUrl}` : ""}`,
    html: `
      <h2>Appointment cancelled</h2>
      <p>This appointment has been cancelled.</p>
      <ul>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Type:</strong> ${details.type}</li>
        <li><strong>Psychologist:</strong> ${payload.psychologistName}</li>
        <li><strong>Patient:</strong> ${payload.patientName}</li>
      </ul>
      ${buildFooter(details.appUrl)}
    `,
  };
};

export const appointmentRescheduleEmail = (
  payload: AppointmentEmailPayload,
  previous: { startTime: Date; endTime: Date }
) => {
  const details = buildDetails(payload);
  const previousDate = formatDate(previous.startTime);
  const previousTime = `${formatTime(previous.startTime)} - ${formatTime(
    previous.endTime
  )}`;

  return {
    subject: "Appointment rescheduled",
    text: `Your appointment has been rescheduled.\nPrevious: ${previousDate} at ${previousTime}\nNew: ${details.date} at ${details.time}\nType: ${details.type}\nPsychologist: ${payload.psychologistName}\nPatient: ${payload.patientName}\n${details.appUrl ? `Manage: ${details.appUrl}` : ""}`,
    html: `
      <h2>Appointment rescheduled</h2>
      <p>Your appointment time has changed.</p>
      <p><strong>Previous:</strong> ${previousDate} at ${previousTime}</p>
      <p><strong>New:</strong> ${details.date} at ${details.time}</p>
      <ul>
        <li><strong>Type:</strong> ${details.type}</li>
        <li><strong>Psychologist:</strong> ${payload.psychologistName}</li>
        <li><strong>Patient:</strong> ${payload.patientName}</li>
      </ul>
      ${buildFooter(details.appUrl)}
    `,
  };
};

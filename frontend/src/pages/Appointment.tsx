export default function Appointment() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-3">Find Professional Support</h2>
      <p className="text-neutral-600 dark:text-neutral-300">
        If you are in crisis or experiencing a mental health emergency, call your local emergency number immediately.
      </p>
      <ul className="list-disc pl-5 mt-4 space-y-2">
        <li>
          National Suicide & Crisis Lifeline: <a className="underline" href="tel:988">988</a> (US)
        </li>
        <li>
          Find a therapist: <a className="underline" href="https://www.psychologytoday.com" target="_blank" rel="noreferrer">Psychology Today</a>
        </li>
        <li>
          Emergency: <a className="underline" href="tel:112">112</a> (EU), <a className="underline" href="tel:999">999</a> (UK)
        </li>
      </ul>
      <p className="mt-4">
        MindWell is a supportive companion, not a replacement for professional care.
      </p>
    </div>
  );
}



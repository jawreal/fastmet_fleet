import { Minus, Plus } from "lucide-react";

interface IQuestions {
  question: string;
  answer: string;
}

const questions: Readonly<IQuestions>[] = [
  {
    question: "Who is FastMet Fleet for?",
    answer:
      "Fleet owners and dispatchers use the web workspace to manage bookings, vehicles, drivers, helpers, and operating costs.",
  },
  {
    question: "Where do FastMet Fleet drivers come from?",
    answer:
      "Drivers come from the FastMet app. In Fleet, your team can review driver and helper records and coordinate crew assignments for trips.",
  },
  {
    question: "Can I record deliveries from my own customers?",
    answer:
      "Yes. Use Direct Booking to enter a delivery arranged with your own customer. The Bookings workspace also shows requests from the FastMet marketplace.",
  },
  {
    question: "What can I track in Fuel?",
    answer:
      "Record the vehicle, driver, odometer reading, liters, price per liter, and station for each fill-up. The Fuel dashboard summarizes spending and estimates fuel economy from full-tank readings.",
  },
  {
    question: "How do I get access?",
    answer:
      "Ask your company administrator for your work credentials. At first sign-in, you’ll replace the temporary password, set up Google Authenticator, and save your recovery codes.",
  },
];

export function FleetFaq() {
  return (
    <section
      id="faq"
      tabIndex={-1}
      aria-labelledby="faq-heading"
      data-fleet-section=""
      className="fleet-split"
    >
      <div data-fleet-motion="up" className="min-w-0">
        <h2 id="faq-heading" className="fleet-heading">
          Frequently asked questions
        </h2>
        <p className="fleet-copy fleet-muted mt-4">
          Find answers about managing your fleet, coordinating drivers, and
          recording deliveries. For account access, contact your company
          administrator.
        </p>
      </div>
      <div data-fleet-motion="up" className="min-w-0">
        <div className="divide-y">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 text-base leading-6 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                {question}
                <Plus
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground group-open:hidden"
                />
                <Minus
                  aria-hidden="true"
                  className="hidden size-4 shrink-0 text-muted-foreground group-open:block"
                />
              </summary>
              <p className="fleet-copy fleet-muted pr-8 pb-5">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

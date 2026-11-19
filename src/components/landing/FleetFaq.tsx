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
    <section id="faq" aria-labelledby="faq-heading" className="bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16 lg:px-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
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
                <p className="max-w-xl pr-8 pb-5 text-base leading-7 text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
        <div className="row-start-1 min-w-0 lg:col-start-2 lg:pt-5">
          <h2
            id="faq-heading"
            className="text-3xl/tight font-semibold tracking-tight text-balance"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Find answers about managing your fleet, coordinating drivers, and
            recording deliveries. For account access, contact your company
            administrator.
          </p>
        </div>
      </div>
    </section>
  );
}

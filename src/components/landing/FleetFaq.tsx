import { ChevronDown } from "lucide-react";

interface IAdvantage {
  title: string;
  description: string;
}

interface IQuestions {
  question: string;
  answer: string;
}

const advantages: Readonly<IAdvantage>[] = [
  {
    title: "FastMet drivers and direct bookings",
    description:
      "Coordinate drivers from the FastMet app alongside bookings you enter for your own customers.",
  },
  {
    title: "Fuel and maintenance records by vehicle",
    description:
      "Review fill-ups, fuel economy, and service history to understand what it costs to run each vehicle.",
  },
  {
    title: "A view of fleet expenses and earnings",
    description:
      "Review vehicle slot renewals, trip earnings, and operating expenses during your fleet’s business review.",
  },
];

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
      aria-labelledby="faq-heading"
      className="border-t bg-muted/30"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[6fr_5fr] lg:gap-16 lg:px-12">
        <div>
          <h2
            id="faq-heading"
            className="text-3xl/tight font-semibold tracking-tight"
          >
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y">
            {questions.map(({ question, answer }) => (
              <details key={question} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-xl pb-4 text-sm leading-6 text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
        <div aria-labelledby="advantages-heading">
          <h2
            id="advantages-heading"
            className="text-3xl/tight font-semibold tracking-tight text-balance sm:text-4xl/tight"
          >
            Why FastMet Fleet?
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Coordinate trips with drivers from the FastMet app and keep the
            records you need to understand what it costs to run your fleet.
          </p>
          <ul className="mt-6 space-y-4 border-l-2 border-primary pl-5">
            {advantages.map(({ title, description }) => (
              <li key={title}>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from '@/landing/components/SectionHeading'

const faqs = [
  {
    question: 'How long does organization approval take?',
    answer:
      'Once you submit your registration and tax document, an administrator typically reviews your request within 1–2 business days. You’ll be notified as soon as a decision is made.',
  },
  {
    question: 'What information do I need to register?',
    answer:
      'You’ll need your organization name, a work email, a password, your tax registration number, and a copy of your tax registration document.',
  },
  {
    question: 'Can I invite both HR and interviewer roles?',
    answer:
      'Yes. Once your organization is approved, HR users can add both HR and interviewer accounts, each with role-appropriate access.',
  },
  {
    question: 'Is my organization’s data isolated from others?',
    answer:
      'Yes. The platform is multi-tenant by design — every organization’s jobs, users, and data are fully isolated from other organizations.',
  },
  {
    question: 'What happens after my organization is approved?',
    answer:
      'You can sign in, invite your team, and start creating job postings right away — with location-aware details captured through an interactive map picker.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-border bg-secondary/40 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know before you register your organization."
        />

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

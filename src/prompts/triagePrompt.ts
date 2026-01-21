export const buildTriagePrompt = (subject: string, body: string) => `
    You are a support ticket triage system.

    Analyze the ticket and return STRICT JSON ONLY with:
    - category (billing | technical | account | sales | other)
    - priority (low | normal | high | urgent)
    - flags:
      - requires_human
      - is_abusive
      - missing_info
      - is_vip_customer

    Ticket:
    Subject: ${subject}
    Body: ${body}
`;

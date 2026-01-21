# Triage Ticket Service

An intelligent support ticket triage system that automatically categorizes tickets, assigns priority, and flags important indicators using LLMs. Built with Node.js and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Set up your API keys in .env file
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here  # Optional
GROK_API_KEY=your_key_here    # Optional

# Run the server
npm run dev
```

The server starts on `http://localhost:3000` (or your configured PORT).

## API Usage

### POST `/triage-ticket`

Send a ticket and get back structured classification with priority, flags, and cost tracking.

**Request:**
```bash
curl -X POST http://localhost:3000/triage-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Payment failed",
    "body": "I tried to pay but the payment was declined."
  }'
```

**Response:**
```json
{
  "category": "billing",
  "priority": "urgent",
  "flags": {
    "requires_human": true,
    "is_abusive": false,
    "missing_info": false,
    "is_vip_customer": false
  },
  "usage": {
    "inputTokens": 245,
    "outputTokens": 18,
    "costUSD": 0.00132
  },
  "used_provider": "openai"
}
```

**Response Fields:**
- `category`: `billing` | `technical` | `account` | `sales` | `other`
- `priority`: `low` | `normal` | `high` | `urgent`
- `flags`: Boolean indicators for `requires_human`, `is_abusive`, `missing_info`, `is_vip_customer`
- `usage`: Token counts and calculated cost in USD
- `used_provider`: Which provider was used (`openai` | `gemini` | `grok`) - useful when automatic fallback occurs

**Optional Fields (not currently implemented, but could be added):**
- `suggested_reply`: AI-generated suggested response to the customer
- `confidence_scores`: Confidence levels for category and priority classifications

## Configuration

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-your-key-here      # Required (at least one)
GEMINI_API_KEY=your-key-here         # Optional
GROK_API_KEY=your-key-here          # Optional
PORT=3000                            # Optional (default: 3000)
```

**Getting API Keys:**
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Grok**: [x.ai](https://x.ai/) → API settings

## How It Works

### Automatic Provider Fallback

The system automatically tries providers in this order: **OpenAI → Gemini → Grok** until one succeeds.

- ✅ **Retryable errors** (network issues, rate limits): Automatically tries next provider
- ❌ **Non-retryable errors** (authentication, invalid model): Returns immediately

No manual provider selection needed—it just works!

### Models & Pricing

Each provider uses a cost-optimized model:

| Provider | Model | Input Cost | Output Cost |
|----------|-------|------------|-------------|
| OpenAI | `gpt-4o-mini` | $0.15/1M | $0.60/1M |
| Gemini | `gemini-2.5-pro` | $1.25/1M | $10.00/1M |
| Grok | `grok-4-1-fast-reasoning` | $0.20/1M | $0.50/1M |

Cost is calculated as: `(inputTokens / 1M × inputCost) + (outputTokens / 1M × outputCost)`

To change models, edit the configuration files in `src/providers/{provider}/models.ts`.


## Design Decisions & Assumptions

### Categories, Priority Levels, and Flags

**Categories** (`billing`, `technical`, `account`, `sales`, `other`): These five categories cover the majority of support ticket types, inferred from ticket content by the LLM with no external database access.

**Priority Levels** (`low`, `normal`, `high`, `urgent`): Priority is determined subjectively based on ticket content (urgency and impact), not explicit customer priority indicators.

**Flags** (`requires_human`, `is_abusive`, `missing_info`, `is_vip_customer`): All flags are inferred from ticket content only; the system has no access to customer records or explicit VIP status indicators.

### Token Counting & Cost Calculation

**Token Counting**: Token counts from provider APIs are assumed accurate and include the full prompt (system instructions + ticket content) for input, and the LLM's JSON response for output.

**Cost Calculation**: Formula: `costUSD = (inputTokens / 1M × inputCost) + (outputTokens / 1M × outputCost)`. Uses standard pricing tiers (no volume discounts), rounded to 6 decimal places. For Gemini, pricing assumes contexts ≤ 200K tokens.

### Provider & Model Selection

**OpenAI - `gpt-4o-mini`** (default): Chosen over `gpt-4o` ($2.50/$10.00 per 1M) and `gpt-4-turbo` ($10/$30 per 1M) because it's 16x cheaper while still providing excellent structured JSON output for ticket classification. For triage tasks that don't require complex reasoning, `gpt-4o-mini` offers the best cost-performance ratio. Most mature API with proven reliability. A free apiKey is also working well.

**Gemini - `gemini-2.5-pro`** (fallback): Selected over `gemini-1.5-pro` and `gemini-1.5-flash` because it's the latest model with improved reasoning capabilities for complex tickets. While more expensive ($1.25/$10.00 per 1M tokens), it excels at analyzing ambiguous or multi-faceted support requests that require nuanced understanding.

**Grok - `grok-4-1-fast-reasoning`** (fallback): Chosen over standard Grok models because it's specifically optimized for rapid decision-making tasks like triage. Competitive pricing ($0.20/$0.50 per 1M tokens) with faster inference than general-purpose models, making it ideal for real-time ticket classification when speed matters.

**Why Multiple Providers?** Automatic fallback ensures reliability, while allowing cost flexibility and performance comparison across different models.

## Examples

**Successful Request:**
```bash
curl -X POST http://localhost:3000/triage-ticket \
  -H "Content-Type: application/json" \
  -d '{"subject": "Payment failed", "body": "I tried to pay but it was declined."}'
```

**Error Responses:**
- **400 Bad Request**: Missing `subject` or `body`
- **500 Internal Server Error**: Provider failures (network, rate limit, authentication, etc.)

All errors include `error`, `code`, and optional `details` fields.


## Logging

All logs are structured JSON with request IDs, timestamps, execution times, and context. Logs include:
- Request tracking (request ID, method, path)
- Provider performance (execution time, tokens, cost)
- Error details (error codes, stack traces)

Log levels: `INFO`, `WARN`, `ERROR`, `DEBUG` (debug only in development mode)

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Tests cover validation, JSON parsing, provider fallback, cost calculation, and API endpoints. All tests use mocks—no real API calls needed.

## Future Improvements

With more time, I'd add:
- **E2E tests** with real provider APIs
- **Health check endpoints** (`/health`, `/ready`)
- **Redis caching** for similar tickets
- **Cost budgets & alerts** to prevent overspending
- **Batch processing** for multiple tickets
- **OpenAPI/Swagger docs** for interactive API exploration
- **Docker setup** for easier deployment

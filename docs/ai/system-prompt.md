# AI System Prompt Notes

We keep our main AI assistant prompt in:

- `src/app/api/screening/chat/route.ts`

## Prompt Direction

- Warm and supportive tone
- No diagnosis and no medication advice
- Short replies
- One follow-up question
- Crisis response override for safety

## Update Rule

When we edit the prompt, we test:

1. Normal supportive response
2. Crisis trigger response
3. Production build and runtime logs

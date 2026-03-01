# Free AI API Setup Guide

## ✅ Already Integrated: Google Gemini (Recommended)

Your app is now configured to use **Google Gemini** which is **100% FREE** with generous limits!

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"** or **"Get API Key"**
3. Select "Create API key in new project" (if first time)
4. Copy your API key (starts with `AIza...`)

### Step 2: Add to Your `.env` File

Open `/Users/maahir/Downloads/New/psyconnect/.env` and add:

```bash
GEMINI_API_KEY=AIzaSyABC123... # Paste your key here
```

### Step 3: Test It!

```bash
# Restart your dev server
npm run dev

# Log in as patient: john@example.com / password123
# Go to: http://localhost:3000/patient/dashboard/screening
# Click "Start Assessment" and chat with the AI!
```

---

## 📊 Gemini Free Tier Limits

- ✅ **60 requests per minute** (very generous!)
- ✅ **1,500 requests per day**
- ✅ **1 million tokens per day**
- ✅ **No credit card required**
- ✅ **No time limit** (free forever)

**Translation:** You can run ~1,500 mental health screenings per day for FREE! More than enough for testing and even production use.

---

## 🔄 Alternative Free AI APIs

### Option 2: Groq (Fast & Free)

**Why Groq:**
- ✅ FREE (30 requests/min)
- ✅ EXTREMELY fast (10x faster than OpenAI)
- ✅ Good quality

**Get API Key:**
1. Go to: https://console.groq.com/keys
2. Sign up (free)
3. Create API key

**Install & Configure:**

```bash
npm install groq-sdk
```

Update `/src/app/api/screening/chat/route.ts`:

```typescript
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// In POST function:
const completion = await groq.chat.completions.create({
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ],
  model: "llama-3.1-8b-instant", // Fast and free
  temperature: 0.7,
  max_tokens: 500,
  stream: true,
});

// Stream handling similar to OpenAI
```

**Free Limits:**
- 30 requests/min
- 14,400 requests/day

---

### Option 3: Hugging Face (Completely Free)

**Why Hugging Face:**
- ✅ Completely FREE (unlimited!)
- ✅ Many models to choose from
- ✅ Open source

**Get API Key:**
1. Go to: https://huggingface.co/settings/tokens
2. Create "Read" token

**Install & Configure:**

```bash
npm install @huggingface/inference
```

Update `/src/app/api/screening/chat/route.ts`:

```typescript
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// In POST function:
const stream = hf.chatCompletionStream({
  model: "mistralai/Mistral-7B-Instruct-v0.2",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ],
  max_tokens: 500,
});

// Stream handling
const encoder = new TextEncoder();
const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      controller.enqueue(encoder.encode(text));
    }
    controller.close();
  },
});

return new Response(readableStream);
```

**Free Limits:**
- Unlimited requests!
- May be slower during peak times

---

## 🎯 Comparison Table

| Provider | Cost | Speed | Quality | Setup | Limits |
|----------|------|-------|---------|-------|--------|
| **Gemini** ✅ | FREE | Fast | Excellent | Easy | 60/min |
| **Groq** | FREE | Very Fast | Good | Easy | 30/min |
| **Hugging Face** | FREE | Moderate | Good | Medium | Unlimited |
| **OpenAI** | Paid | Fast | Excellent | Easy | Pay-per-use |

---

## 💡 Recommendation

**Use Google Gemini** (already configured!) because:

1. ✅ **Best balance** of speed, quality, and limits
2. ✅ **Already integrated** - just add API key
3. ✅ **Very reliable** - backed by Google infrastructure
4. ✅ **Great for production** - can handle real traffic

---

## 🧪 Test Your Setup

### Quick Test:

1. **Add API key to `.env`:**
   ```bash
   GEMINI_API_KEY=your_key_here
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **Test in browser:**
   - Go to: http://localhost:3000/patient/dashboard/screening
   - Click "Start Assessment"
   - Type: "I've been feeling anxious"
   - You should see AI response streaming in!

### If It Works:
✅ You're all set! The AI is responding.

### If Error: "API key is invalid"
1. Double-check the key in `.env` (no quotes needed around value)
2. Make sure key starts with `AIza`
3. Restart dev server: `npm run dev`

### If Error: "Failed to process chat request"
1. Check console logs: `F12 → Console`
2. Check server terminal for errors
3. Verify internet connection

---

## 🔐 Security Tips

1. **Never commit `.env` file** to git (already in .gitignore)
2. **Never share your API key** publicly
3. **Use different keys** for dev and production
4. **Rotate keys** if exposed

---

## 💰 Cost Comparison

**For 1,000 mental health screenings:**

| Provider | Cost |
|----------|------|
| Gemini | **$0.00** (FREE) |
| Groq | **$0.00** (FREE) |
| Hugging Face | **$0.00** (FREE) |
| OpenAI GPT-4o-mini | ~$10-20 |
| OpenAI GPT-4 | ~$30-50 |

---

## 🚀 Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Add `GEMINI_API_KEY` to environment variables
2. No other changes needed!
3. Monitor usage at: https://makersuite.google.com/app/usage

---

## 📚 Documentation Links

- **Gemini API Docs:** https://ai.google.dev/docs
- **Gemini Pricing:** https://ai.google.dev/pricing (Free tier!)
- **Groq Docs:** https://console.groq.com/docs
- **Hugging Face Docs:** https://huggingface.co/docs/api-inference

---

## 🆘 Troubleshooting

### Error: "GEMINI_API_KEY is not defined"

**Solution:**
```bash
# Make sure .env file has:
GEMINI_API_KEY=AIzaSy...your_key

# Restart server:
npm run dev
```

### Error: "Resource has been exhausted"

**Solution:** You hit the rate limit (60/min). Wait 1 minute or upgrade to paid tier.

### AI responses are weird/incorrect

**Solution:** The prompt might need tuning. Edit `SYSTEM_PROMPT` in `/src/app/api/screening/chat/route.ts`.

### Want to switch back to OpenAI?

**Solution:** Check `ALTERNATIVE_AI_APIS.md` for code snippets to switch providers.

---

## ✅ You're All Set!

Your app now uses **Google Gemini** for FREE AI mental health screening. Just add your API key and start testing!

**Next Steps:**
1. Get Gemini API key (5 minutes)
2. Add to `.env`
3. Test screening feature
4. Deploy to production (optional)

---

**Questions?** Check the console logs or refer to the TESTING_GUIDE.md for more details.

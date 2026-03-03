# History 4 — AI Assistant and Reliability

## What We Changed

We changed the patient Screening experience into an AI Assistant chat experience.
We updated prompts and safety behavior to follow warm support style with crisis handling.

## Reliability Work

We added provider fallback logic so chat does not fail easily:

- OpenRouter main model
- OpenRouter fallback models
- Groq fallback
- Local fallback response

## Why This Phase Mattered

This gave us a safer and more reliable AI support flow for patients.

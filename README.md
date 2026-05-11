
# 🔍 Hallucinations Detector




<br>

## 🎯 What is Hallucinations Detector?

Hallucinations Detector is a free and open-source tool that helps you verify the accuracy of your content instantly. Think of it as Grammarly, but for factual accuracy instead of grammar. It analyzes your content, identifies potential inaccuracies, and suggests corrections backed by reliable web sources.

<br>

## ✨ Key Features

- Real-time fact checking of your LLM generated content
- Source-backed verification
- Detailed explanations for identified inaccuracies
- Suggestion-based corrections

<br>

## 🛠️ How It Works

1. **Claim Extraction**: When you input your content, the tool uses Gemini to break down your text into individual claims.

2. **Source Verification**: Each claim is checked using Exa’s search tool to find reliable sources online that either support or refute it.

3. **Accuracy Analysis**: The claims and their corresponding sources are analyzed by our LLM to determine their accuracy.

4. **Results Display**: Finally, we show the results in a simple, clear way, pointing out any mistakes and offering suggestions to fix them.

<br>

## 💻 Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/docs) with App Router, [TailwindCSS](https://tailwindcss.com), TypeScript
- **LLM**: [Google Gemini](https://ai.google.dev/gemini-api/docs) via the Vercel AI SDK
- **AI Integration**: Gemini REST API
- **Hosting**: [Vercel](https://vercel.com/) for hosting and analytics

<br>

## 🚀 Getting Started

### Prerequisites
- Node.js
- API keys for Gemini

### Installation

1. Clone the repository
```bash
git clone https://github.com/exa-labs/exa-hallucination-detector.git
cd exa-hallucination-detector
````

2.  Install dependencies
    

```
npm install
# or
yarn install
```

3.  Set up environment variables Create a `.env.local` file in the root directory and add your API keys:
    

```

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

4.  Run the development server
    

```
npm run dev
# or
yarn dev
```

5.  Open http://localhost:3000 in your browser
    
<br>

## 🔑 API Keys

    
*   Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
    
<br>


    



<br>

* * *




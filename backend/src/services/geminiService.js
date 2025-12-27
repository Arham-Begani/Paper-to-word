const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

exports.processWithGemini = async (inputData, solveQuestions = false) => {
    try {
        // Schema definition for strict JSON output
        const schema = {
            description: "Document extraction result",
            type: SchemaType.OBJECT,
            properties: {
                detectedType: {
                    type: SchemaType.STRING,
                    description: "Type of document: 'Question Paper', 'Book', or 'Other'",
                    nullable: false,
                },
                markdownContent: {
                    type: SchemaType.STRING,
                    description: "The full content of the document in strict Markdown format. Use **bold** for importance/keys. Use Unicode for math symbols where possible.",
                    nullable: false,
                },
            },
            required: ["detectedType", "markdownContent"],
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        let promptParts = [];

        let systemInstruction = `
    You are an AI document processor.
    
    Task:
    1. Analyze the input (Image or Text) visually.
    2. Transcribe the text/math/tables perfectly into Markdown.
    3. **Math Handling**:
       - Attempt to use Unicode symbols for math (e.g., θ, π, σ, ½, ², √) instead of LaTeX backslashes where possible to ensure compatibility.
       - If LaTeX is absolutely necessary for complex formulas, you MUST double-escape backslashes (e.g. \\\\frac{a}{b}).
    4. **Structure**:
       - Use **bold** for Question Numbers (e.g. "**1.**", "**Q1.**").
       - Preserve indentation / lists.
    `;

        if (solveQuestions) {
            systemInstruction += `
    5. **SOLVE MATH QUESTIONS**:
       - The user wants the ANSWERS to the questions in the document.
       - For each question detected, solve it step-by-step.
       - Append the solution immediately after the question in an *Italicized Block* or > Blockquote.
       - Format: "**Answer:** ...step by step solution..."
       `;
        }

        promptParts.push(systemInstruction);

        if (inputData.type === 'image') {
            promptParts.push({
                inlineData: {
                    data: inputData.data,
                    mimeType: inputData.mimeType
                }
            });
            promptParts.push("Transcribe this image.");
        } else {
            promptParts.push(`Input Text:\n"""\n${inputData.content.slice(0, 30000)}\n"""`);
        }

        const result = await model.generateContent(promptParts);
        const text = result.response.text();

        // With responseMimeType: 'application/json', the text IS the JSON.
        // No need to strip markdown code blocks.
        try {
            return JSON.parse(text);
        } catch (e) {
            // Fallback cleanup if the model still wraps it despite config (rare but possible)
            const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            detectedType: "Error",
            markdownContent: `Processing Failed: ${error.message}.`
        };
    }
};

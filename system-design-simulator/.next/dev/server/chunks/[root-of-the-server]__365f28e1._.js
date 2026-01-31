module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/Git/system-design/system-design-simulator/src/lib/ollama.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkOllamaHealth",
    ()=>checkOllamaHealth,
    "createOllamaSSEStream",
    ()=>createOllamaSSEStream,
    "default",
    ()=>__TURBOPACK__default__export__,
    "listModels",
    ()=>listModels,
    "ollama",
    ()=>ollama,
    "ollamaChat",
    ()=>ollamaChat,
    "ollamaChatStream",
    ()=>ollamaChatStream
]);
/**
 * Ollama Client for Local LLM Inference
 *
 * Uses Ollama running locally for faster interview interactions.
 * Default model: llama3 (8B)
 *
 * Make sure Ollama is running: ollama serve
 * Pull the model: ollama pull llama3
 */ const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
async function checkOllamaHealth() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: "GET"
        });
        return response.ok;
    } catch  {
        return false;
    }
}
async function listModels() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.models?.map((m)=>m.name) || [];
    } catch  {
        return [];
    }
}
async function ollamaChat(options) {
    const { model = OLLAMA_MODEL, messages, temperature = 0.7 } = options;
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages,
            stream: false,
            options: {
                temperature,
                num_predict: options.max_tokens || 800,
                top_p: options.top_p || 0.9,
                stop: options.stop
            }
        })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error: ${error}`);
    }
    return response.json();
}
async function ollamaChatStream(options) {
    const { model = OLLAMA_MODEL, messages, temperature = 0.7 } = options;
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            options: {
                temperature,
                num_predict: options.max_tokens || 800,
                top_p: options.top_p || 0.9,
                stop: options.stop
            }
        })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama streaming error: ${error}`);
    }
    if (!response.body) {
        throw new Error("No response body from Ollama");
    }
    return response.body;
}
function createOllamaSSEStream(ollamaStream) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";
    return new ReadableStream({
        async start (controller) {
            const reader = ollamaStream.getReader();
            try {
                while(true){
                    const { done, value } = await reader.read();
                    if (done) {
                        controller.close();
                        break;
                    }
                    buffer += decoder.decode(value, {
                        stream: true
                    });
                    // Process complete JSON lines
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";
                    for (const line of lines){
                        if (line.trim()) {
                            try {
                                const json = JSON.parse(line);
                                if (json.message?.content) {
                                    // Send as SSE format
                                    const sseData = `data: ${JSON.stringify({
                                        content: json.message.content
                                    })}\n\n`;
                                    controller.enqueue(encoder.encode(sseData));
                                }
                                if (json.done) {
                                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                                }
                            } catch  {
                            // Skip invalid JSON lines
                            }
                        }
                    }
                }
            } catch (error) {
                controller.error(error);
            }
        }
    });
}
const ollama = {
    chat: {
        completions: {
            create: async (options)=>{
                if (options.stream) {
                    const stream = await ollamaChatStream({
                        model: options.model || OLLAMA_MODEL,
                        messages: options.messages,
                        temperature: options.temperature,
                        max_tokens: options.max_tokens,
                        stream: true
                    });
                    return {
                        body: createOllamaSSEStream(stream)
                    };
                } else {
                    const response = await ollamaChat({
                        model: options.model || OLLAMA_MODEL,
                        messages: options.messages,
                        temperature: options.temperature,
                        max_tokens: options.max_tokens,
                        stream: false
                    });
                    return {
                        choices: [
                            {
                                message: {
                                    role: response.message.role,
                                    content: response.message.content
                                }
                            }
                        ]
                    };
                }
            }
        }
    }
};
const __TURBOPACK__default__export__ = ollama;
}),
"[project]/Documents/Git/system-design/system-design-simulator/src/app/api/ollama/status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
/**
 * Ollama Status Check API
 *
 * GET /api/ollama/status
 * Returns the status of Ollama and available models
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Git/system-design/system-design-simulator/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Git/system-design/system-design-simulator/src/lib/ollama.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const isHealthy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
        if (!isHealthy) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                status: "offline",
                message: "Ollama is not running. Start it with: ollama serve",
                models: []
            });
        }
        const models = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listModels"])();
        const hasLlama3 = models.some((m)=>m.includes("llama3") || m.includes("llama3:8b"));
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: "online",
            message: hasLlama3 ? "Ollama is running with llama3" : "Ollama is running but llama3 not found. Run: ollama pull llama3",
            models,
            recommendedModel: "llama3",
            hasRecommendedModel: hasLlama3
        });
    } catch (error) {
        console.error("Ollama status check error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: "error",
            message: "Failed to check Ollama status",
            models: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__365f28e1._.js.map
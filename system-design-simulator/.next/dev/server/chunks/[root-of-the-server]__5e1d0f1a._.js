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
"[project]/Documents/Git/system-design/system-design-simulator/src/app/api/help-bot/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
/**
 * Help Bot API
 *
 * Proxies requests to the Python RAG service.
 * Handles rate limiting errors gracefully.
 *
 * POST /api/help-bot
 * Body: { question: string }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Git/system-design/system-design-simulator/node_modules/next/server.js [app-route] (ecmascript)");
;
const HELP_BOT_URL = process.env.HELP_BOT_URL || "http://localhost:8001";
async function POST(request) {
    try {
        const body = await request.json();
        const { question } = body;
        if (!question || typeof question !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Question is required"
            }, {
                status: 400
            });
        }
        // Forward to Python RAG service
        const response = await fetch(`${HELP_BOT_URL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Forward client IP for rate limiting
                "X-Forwarded-For": request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
            },
            body: JSON.stringify({
                question
            })
        });
        // Handle rate limit exceeded
        if (response.status === 429) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Rate limit exceeded",
                message: "Too many requests. Please wait a moment before asking another question.",
                retryAfter: response.headers.get("Retry-After") || "60"
            }, {
                status: 429
            });
        }
        if (!response.ok) {
            const error = await response.text();
            console.error("Help bot service error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Help bot service unavailable"
            }, {
                status: 503
            });
        }
        const data = await response.json();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error("Help bot API error:", error);
        // Check if it's a connection error
        if (error instanceof TypeError && error.message.includes("fetch")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Help bot service is not running",
                hint: "Start the help-bot service: cd help-bot && python main.py"
            }, {
                status: 503
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
async function GET() {
    try {
        const response = await fetch(`${HELP_BOT_URL}/health`, {
            method: "GET"
        });
        if (!response.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                status: "unavailable"
            }, {
                status: 503
            });
        }
        const data = await response.json();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: "unavailable",
            hint: "Start the help-bot service: cd help-bot && python main.py"
        }, {
            status: 503
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5e1d0f1a._.js.map
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const [messages] = useState([
    {
      role: "assistant",
      content: "Welcome to the Help Center! I am disabled in this view-only demo, but normally I would answer your questions about the platform."
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about the System Design Simulator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chat with Help Bot</CardTitle>
            <CardDescription>
              Disabled in View-Only Mode
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] px-6 py-4 flex flex-col justify-end">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                      <p className="text-sm">{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <input type="text" disabled placeholder="Type a message..." className="flex-1 px-4 py-2 border rounded-lg bg-muted/50 cursor-not-allowed" />
                  <Button disabled>Send</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 opacity-60">
              <Button variant="outline" className="w-full justify-start" disabled>How to start?</Button>
              <Button variant="outline" className="w-full justify-start" disabled>Scoring guide</Button>
              <Button variant="outline" className="w-full justify-start" disabled>Interview tips</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

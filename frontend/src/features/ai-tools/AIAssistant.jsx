import { useState } from 'react';
import { Card, PageHeader, Button } from '../../components/ui';
import { Sparkles, Send, Bot } from 'lucide-react';

export default function AIAssistant() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI School Assistant. How can I help you today? I can help with report generation, analyzing student performance, or answering general questions.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Add user message
        const userMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        // Simulate AI response for now
        setTimeout(() => {
            const responses = [
                "I can certainly help with that. Let me analyze the data for you.",
                "Based on the current attendance records, Grade 10-A has the highest attendance rate.",
                "I've generated a draft report for the upcoming parent-teacher meeting.",
                "That feature is coming soon! Is there anything else I can assist with?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <PageHeader
                title="AI Assistant"
                description="Your intelligent school management companion"
            />

            <Card className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {msg.role === 'user' ? <UserIcon /> : <Bot size={18} />}
                                </div>
                                <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex flex-row items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask me anything..."
                            className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                        <SuggestionChip text="Generate Monthly Report" onClick={() => setQuery("Generate Monthly Report")} />
                        <SuggestionChip text="Show Attendance Trends" onClick={() => setQuery("Show Attendance Trends")} />
                        <SuggestionChip text="Highlight At-Risk Students" onClick={() => setQuery("Highlight At-Risk Students")} />
                    </div>
                </div>
            </Card>
        </div>
    );
}

function SuggestionChip({ text, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="whitespace-nowrap px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center gap-1"
        >
            <Sparkles size={12} />
            {text}
        </button>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    );
}

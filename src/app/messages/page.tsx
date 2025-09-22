
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore";
import type { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function MessagesPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "messages"),
            where("userId", "==", user.uid),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const msgs: Message[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            
            // Mark messages from admin as read
            const unreadMessages = snapshot.docs.filter(doc => doc.data().senderId === 'admin' && !doc.data().isRead);
            for (const docSnap of unreadMessages) {
                const docRef = doc(db, "messages", docSnap.id);
                await updateDoc(docRef, { isRead: true });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, "messages"), {
                userId: user.uid,
                text: newMessage,
                senderId: user.uid,
                timestamp: serverTimestamp(),
                isRead: false,
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const UserAvatar = ({ senderId }: { senderId: string }) => {
        const isUser = senderId !== 'admin';
        return (
            <Avatar className="w-8 h-8">
                <AvatarFallback className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-background")}>
                    {isUser ? user?.displayName?.charAt(0) : "A"}
                </AvatarFallback>
            </Avatar>
        );
    }


    return (
        <div className="flex flex-col h-screen">
             <header className="flex items-center gap-2 p-4 border-b">
                <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
                    <Link href="/profile">
                        <ChevronLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-bold">Admin Support</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                        {msg.senderId !== user?.uid && <UserAvatar senderId={msg.senderId} />}
                        <div className={cn("max-w-[75%] p-3 rounded-2xl", msg.senderId === user?.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                        {msg.senderId === user?.uid && <UserAvatar senderId={msg.senderId} />}
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </div>
        </div>
    );
}

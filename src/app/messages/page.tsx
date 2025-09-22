
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, DocumentData } from "firebase/firestore";
import type { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from 'date-fns';
import { useUserData } from "@/hooks/use-user-data";


export default function MessagesPage() {
    const { user } = useAuth();
    const { userData } = useUserData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [senders, setSenders] = useState<Record<string, DocumentData>>({});

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
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const msgs: Message[] = [];
            const unreadMessageIdsToUpdate: string[] = [];
            const senderIdsToFetch = new Set<string>();
            
            snapshot.docs.forEach(docSnap => {
                const msg = { id: docSnap.id, ...docSnap.data() } as Message;
                msgs.push(msg);

                if (msg.senderId !== user.uid) {
                    senderIdsToFetch.add(msg.senderId);
                    if (!msg.isRead) {
                        unreadMessageIdsToUpdate.push(docSnap.id);
                    }
                }
            });
            
            // Sort messages by timestamp client-side
            msgs.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return a.timestamp.toMillis() - b.timestamp.toMillis();
            });

            setMessages(msgs);

            // Fetch sender data if we have new senders
            senderIdsToFetch.forEach(async (senderId) => {
                if (!senders[senderId]) {
                    const userDocRef = doc(db, 'users', senderId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setSenders(prev => ({ ...prev, [senderId]: userDocSnap.data() }));
                    } else {
                        // Fallback for admin or system messages not in users collection
                         setSenders(prev => ({ ...prev, [senderId]: { displayName: "Admin" } }));
                    }
                }
            });

            // Mark messages as read
            for (const messageId of unreadMessageIdsToUpdate) {
                const docRef = doc(db, "messages", messageId);
                await updateDoc(docRef, { isRead: true });
            }
        }, (error) => {
             console.error("Firestore snapshot error:", error);
        });

        return () => unsubscribe();
    }, [user, senders]);

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
        const isUser = senderId === user?.uid;
        const sender = senders[senderId];
        
        let initial = 'A';
        if (isUser) {
            initial = userData?.displayName?.charAt(0).toUpperCase() || 'U';
        } else if (sender) {
            initial = sender?.displayName?.charAt(0).toUpperCase() || 'A';
        }

        return (
            <Avatar className="w-8 h-8">
                <AvatarFallback className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-background")}>
                    {initial}
                </AvatarFallback>
            </Avatar>
        );
    }


    return (
        <div className="flex flex-col h-[calc(100dvh)] bg-background">
             <header className="flex-shrink-0 flex items-center gap-2 p-4 border-b z-10 bg-background h-16">
                <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
                    <Link href="/profile">
                        <ChevronLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-bold">Support Chat</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                    if (!user) return null;
                    const isUser = msg.senderId === user.uid;
                    const sender = senders[msg.senderId];
                    const senderName = isUser ? "You" : sender?.displayName || "Admin";
                    const timestamp = msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm') : '';

                    return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
                        {!isUser && <UserAvatar senderId={msg.senderId} />}
                        <div className={cn("max-w-[70%] p-3 rounded-2xl group", isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                             <div className="text-xs mt-1.5 flex justify-end gap-2 opacity-80">
                                <span>{senderName}</span>
                                <span>{timestamp}</span>
                            </div>
                        </div>
                        {isUser && <UserAvatar senderId={msg.senderId} />}
                    </div>
                )})}
                 <div ref={messagesEndRef} />
            </main>
            <footer className="flex-shrink-0 p-4 border-t bg-background z-10">
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
            </footer>
        </div>
    );
}

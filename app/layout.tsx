import '@/app/ui/global.css';
import React from "react";
import {inter} from "@/app/ui/fonts";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.className} antialiased`}>
        <div className="bg-zinc-800 text-white flex min-h-screen flex-col p-4">
            <Header/>
            {children}
        </div>
        </body>
        </html>
    );
}

const Header = () => {
    return <div className={"block font-bold text-center text-4xl"}>
        <h1>Trans Voice Trainer</h1>
    </div>
}
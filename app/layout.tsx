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
    return <div className={"font-bold text-3xl md:text-4xl flex justify-center items-center gap-x-5"}>
        <h1>Trans Voice Trainer</h1>
        <a href="https://github.com/natdorshimer/trans-voice-trainer"><i className="fab fa-github text-right text-2xl"></i></a>
    </div>
}
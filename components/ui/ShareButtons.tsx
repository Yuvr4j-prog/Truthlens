"use client";
import { useState } from 'react';
import { Twitter, Linkedin, Users } from 'lucide-react';

export default function ShareButtons() {
    const [copyMessage, setCopyMessage] = useState('');
    const toolUrl = 'https://truthlens.com';
    const shareText = `Just saw this AI tool which can detect hallucinations in your content, seems cool \n\n${toolUrl}`;

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    };

    const shareOnLinkedIn = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`;
        window.open(linkedinUrl, '_blank');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(toolUrl);
            setCopyMessage('Copied! Now share the link with your team 🚀');
            setTimeout(() => setCopyMessage(''), 3000);
        } catch (err) {
            setCopyMessage('Failed to copy');
        }
    };

    return (
        <div className="my-12 pt-12 space-y-6 opacity-0 animate-fade-up">
            <h3 className="text-lg text-center text-black mb-6">
                Share this hallucinations detector tool now!
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
                <button
                    onClick={shareOnTwitter}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white rounded-none hover:bg-[#1a8cd8] transition-colors duration-200"
                >
                    <Twitter size={20} />
                    <span>Share on Twitter</span>
                </button>

                <button
                    onClick={shareOnLinkedIn}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded-none hover:bg-[#094d92] transition-colors duration-200"
                >
                    <Linkedin size={20} />
                    <span>Share on LinkedIn</span>
                </button>

                <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-none hover:bg-gray-700 transition-colors duration-200"
                >
                    <Users size={20} />
                    <span>Share with Your Team</span>
                </button>
            </div>
            {copyMessage && (
                <div className="text-center text-green-600 font-medium mt-4 animate-fade-up">
                    {copyMessage}
                </div>
            )}
        </div>
    );
}
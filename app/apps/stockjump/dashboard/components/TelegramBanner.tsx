import { Send, X } from "lucide-react";

interface TelegramBannerProps {
    onClose?: () => void;
}

export default function TelegramBanner({ onClose }: TelegramBannerProps) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#0d4d6b] bg-[#072d42] px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1890cd] text-white shadow-inner">
                    <Send className="h-4 w-4" fill="currentColor" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                    Get real-time earnings alerts on our Telegram channel
                </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <a
                    href="#"
                    className="rounded-xl bg-[#168dcc] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1b9de0] shadow-sm"
                >
                    Join Channel
                </a>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
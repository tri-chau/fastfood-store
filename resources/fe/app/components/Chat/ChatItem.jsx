import React from "react";

const ChatItem = ({ message, isSelf }) => {
    return (
        <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`rounded-lg px-3 py-2 max-w-[70%] ${isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                <div className="text-sm">{message.content}</div>
                <div className="text-xs text-right opacity-70 mt-1">{message.timestamp}</div>
            </div>
        </div>
    );
};
export default ChatItem;

import React from "react";
import { PartyRoomCard, PartyRoom } from "./PartyRoomCard";
import { cn } from "@/lib/utils";

interface PartyRoomListProps {
  rooms: PartyRoom[];
  onRoomClick: (room: PartyRoom) => void;
}

export function PartyRoomList({ rooms, onRoomClick }: PartyRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🎙️</span>
        <p className="text-muted-foreground text-sm">No party rooms yet</p>
        <p className="text-muted-foreground/70 text-xs mt-1">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {rooms.map((room, index) => (
        <div
          key={room.id}
          className={cn("animate-fade-in-up", `stagger-${(index % 6) + 1}`)}
        >
          <PartyRoomCard room={room} onClick={() => onRoomClick(room)} />
        </div>
      ))}
    </div>
  );
}

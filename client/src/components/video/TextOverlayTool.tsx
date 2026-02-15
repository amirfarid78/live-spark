import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Palette } from "lucide-react";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  align: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
}

interface TextOverlayToolProps {
  overlays: TextOverlay[];
  onAddOverlay: (overlay: TextOverlay) => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onRemoveOverlay: (id: string) => void;
  onClose: () => void;
}

const fontFamilies = [
  { id: 'sans', label: 'Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
  { id: 'serif', label: 'Serif', value: 'ui-serif, Georgia, serif' },
  { id: 'mono', label: 'Mono', value: 'ui-monospace, monospace' },
  { id: 'cursive', label: 'Script', value: 'cursive' },
];

const colors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF6B6B', '#4ECDC4',
];

const backgroundColors = [
  'transparent', '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#333333',
];

export default function TextOverlayTool({ 
  overlays, 
  onAddOverlay, 
  onUpdateOverlay, 
  onRemoveOverlay,
  onClose 
}: TextOverlayToolProps) {
  const [currentText, setCurrentText] = useState('');
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0].value);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedBg, setSelectedBg] = useState('transparent');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'bg' | null>(null);

  const handleAddText = () => {
    if (!currentText.trim()) return;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: currentText,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: selectedFont,
      color: selectedColor,
      backgroundColor: selectedBg,
      align,
      isBold,
      isItalic,
    };

    onAddOverlay(newOverlay);
    setCurrentText('');
  };

  return (
    <div className="absolute bottom-32 left-0 right-0 z-30 px-4 animate-fade-in">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Add Text</h3>
          <button 
            onClick={onClose}
            className="text-white/50 text-sm press-effect"
          >
            Done
          </button>
        </div>

        {/* Text input */}
        <Input
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Enter your text..."
          className="bg-white/10 border-0 text-white placeholder:text-white/50 mb-4"
          style={{
            fontFamily: selectedFont,
            color: selectedColor,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textAlign: align,
          }}
        />

        {/* Font selection */}
        <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
          {fontFamilies.map((font) => (
            <button
              key={font.id}
              onClick={() => setSelectedFont(font.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors press-effect",
                selectedFont === font.value
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/70"
              )}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </button>
          ))}
        </div>

        {/* Style buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setIsBold(!isBold)}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors press-effect",
              isBold ? "bg-primary text-white" : "bg-white/10 text-white/70"
            )}
          >
            <Bold className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors press-effect",
              isItalic ? "bg-primary text-white" : "bg-white/10 text-white/70"
            )}
          >
            <Italic className="h-5 w-5" />
          </button>
          
          <div className="h-10 w-px bg-white/20 mx-1" />
          
          <button
            onClick={() => setAlign('left')}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors press-effect",
              align === 'left' ? "bg-primary text-white" : "bg-white/10 text-white/70"
            )}
          >
            <AlignLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setAlign('center')}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors press-effect",
              align === 'center' ? "bg-primary text-white" : "bg-white/10 text-white/70"
            )}
          >
            <AlignCenter className="h-5 w-5" />
          </button>
          <button
            onClick={() => setAlign('right')}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors press-effect",
              align === 'right' ? "bg-primary text-white" : "bg-white/10 text-white/70"
            )}
          >
            <AlignRight className="h-5 w-5" />
          </button>
          
          <div className="h-10 w-px bg-white/20 mx-1" />
          
          {/* Color picker toggle */}
          <button
            onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
            className="h-10 w-10 rounded-lg flex items-center justify-center bg-white/10 press-effect"
          >
            <div className="h-6 w-6 rounded-full border-2 border-white" style={{ backgroundColor: selectedColor }} />
          </button>
          <button
            onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
            className="h-10 w-10 rounded-lg flex items-center justify-center bg-white/10 press-effect"
          >
            <Palette className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Color pickers */}
        {showColorPicker && (
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
            {(showColorPicker === 'text' ? colors : backgroundColors).map((color) => (
              <button
                key={color}
                onClick={() => {
                  if (showColorPicker === 'text') {
                    setSelectedColor(color);
                  } else {
                    setSelectedBg(color);
                  }
                }}
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex-shrink-0 press-effect",
                  (showColorPicker === 'text' ? selectedColor : selectedBg) === color
                    ? "border-primary scale-110"
                    : "border-white/30"
                )}
                style={{ 
                  backgroundColor: color === 'transparent' ? 'transparent' : color,
                  backgroundImage: color === 'transparent' 
                    ? 'linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)'
                    : undefined,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAddText}
          disabled={!currentText.trim()}
          className={cn(
            "w-full py-3 rounded-xl font-semibold transition-all press-effect",
            currentText.trim()
              ? "bg-primary text-white"
              : "bg-white/10 text-white/30"
          )}
        >
          Add Text
        </button>

        {/* Existing overlays */}
        {overlays.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-white/50 text-xs">Added texts:</span>
            {overlays.map((overlay) => (
              <div 
                key={overlay.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
              >
                <span 
                  className="text-sm truncate flex-1"
                  style={{ 
                    color: overlay.color,
                    fontFamily: overlay.fontFamily,
                  }}
                >
                  {overlay.text}
                </span>
                <button
                  onClick={() => onRemoveOverlay(overlay.id)}
                  className="text-red-400 text-xs ml-2 press-effect"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

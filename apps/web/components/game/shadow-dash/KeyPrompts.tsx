import React from "react";

interface KeyPromptsProps {
  visible: boolean;
  variant?: "dash" | "mario";
}

export const KeyPrompts: React.FC<KeyPromptsProps> = ({
  visible,
  variant = "dash",
}) => {
  if (variant === "mario") {
    return (
      <div className={`key-prompts ${visible ? "visible" : "hidden"}`}>
        <div className="prompt-item">
          <span className="prompt-kbd">A</span>
          <span className="prompt-kbd">D</span>
          <span className="prompt-desc">移动</span>
        </div>
        <div className="prompt-item">
          <span className="prompt-kbd">Space</span>
          <span className="prompt-desc">跳跃（短按低跳）</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`key-prompts ${visible ? "visible" : "hidden"}`}>
      <div className="prompt-item">
        <span className="prompt-kbd">A</span>
        <span className="prompt-kbd">D</span>
        <span className="prompt-desc">移动</span>
      </div>
      <div className="prompt-item">
        <span className="prompt-kbd">Space</span>
        <span className="prompt-desc">跳跃</span>
      </div>
      <div className="prompt-item">
        <span className="prompt-kbd">Shift</span>
        <span className="prompt-desc">冲刺</span>
      </div>
    </div>
  );
};

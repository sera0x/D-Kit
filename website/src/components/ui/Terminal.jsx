"use client";
import { useEffect, useRef, useState } from "react";
import "./Terminal.css";

const buildFrames = (commands, outputs, typingSpeed, delayBetweenCommands) => {
  const frames = [];
  commands.forEach((cmd, idx) => {
    const prompt = `$ ${cmd}`;
    for (let i = 1; i <= prompt.length; i++) {
      frames.push({ kind: "typing", text: prompt.slice(0, i), wait: typingSpeed });
    }
    frames.push({ kind: "holdCommand", text: prompt, wait: delayBetweenCommands });

    const outLines = outputs[idx] || [];
    outLines.forEach(line => {
      frames.push({ kind: "output", text: line, wait: 350 });
    });

    if (idx < commands.length - 1) {
      frames.push({ kind: "gap", wait: delayBetweenCommands });
    }
  });
  return frames;
};

const Terminal = ({
  commands = [],
  outputs = {},
  typingSpeed = 45,
  delayBetweenCommands = 800,
  className = "",
}) => {
  const [finalizedLines, setFinalizedLines] = useState([]);
  const [typingText, setTypingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!commands.length) return;

    const frames = buildFrames(commands, outputs, typingSpeed, delayBetweenCommands);
    let frameIndex = 0;
    let timeoutId = null;

    setFinalizedLines([]);
    setTypingText("");
    setIsComplete(false);

    const step = () => {
      if (!isMounted.current) return;
      if (frameIndex >= frames.length) {
        setIsComplete(true);
        return;
      }

      const frame = frames[frameIndex];
      if (frame.kind === "typing") {
        setTypingText(frame.text);
      } else if (frame.kind === "holdCommand") {
        setFinalizedLines(prev => [...prev, frame.text]);
        setTypingText("");
      } else if (frame.kind === "output") {
        setFinalizedLines(prev => [...prev, frame.text]);
      }

      frameIndex++;
      timeoutId = setTimeout(step, frame.wait);
    };

    timeoutId = setTimeout(step, 500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [commands, outputs, typingSpeed, delayBetweenCommands]);

  return (
    <div className={`terminal-window ${className}`.trim()}>
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="terminal-titlebar-label">terminal.dkit.dev</span>
      </div>
      <div className="terminal-body">
        {finalizedLines.map((line, i) => (
          <div key={i} className="terminal-line">{line || "\u00A0"}</div>
        ))}
        {!isComplete && (
          <div className="terminal-line">
            {typingText}
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
};

export { Terminal };

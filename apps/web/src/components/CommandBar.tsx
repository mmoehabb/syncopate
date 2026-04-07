'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useCommand } from '../context/CommandContext'

export function CommandBar() {
  const { mode, setMode, outputHistory, executeCommand } = useCommand()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)

  // Focus input when entering command mode
  useEffect(() => {
    if (mode === 'command' && inputRef.current) {
      inputRef.current.focus()
    } else if (mode === 'normal' && inputRef.current) {
      inputRef.current.blur()
      setInputValue('') // clear input when exiting command mode
    }
  }, [mode])

  // Scroll to bottom of output when new output is added
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [outputHistory, mode]) // also scroll when mode opens

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        executeCommand(inputValue)
        setInputValue('')
        // After command execution, user might want to stay in command mode or we could switch.
        // We'll keep them in command mode so they can read the output. Escape handles exit.
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setMode('normal')
    }
  }

  if (mode === 'normal' && outputHistory.length === 0) {
    return null // Don't show anything if in normal mode and no output
  }

  return (
    <div
      className={`fixed bottom-0 left-0 w-full z-50 flex flex-col justify-end transition-transform duration-300 ${
        mode === 'command' ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Terminal Output Area */}
      {outputHistory.length > 0 && mode === 'command' && (
        <div className="bg-obsidian-night/95 border-t border-white/10 p-4 max-h-[50vh] overflow-y-auto backdrop-blur-md font-mono text-sm text-syntax-grey">
          <div className="flex flex-col gap-1 max-w-5xl mx-auto w-full">
            {outputHistory.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>
        </div>
      )}

      {/* Command Input Area */}
      <div className="bg-void-grey border-t border-white/10 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-2">
          <span className="text-neon-pulse font-mono font-bold">/</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Optionally revert to normal mode on blur
              // setMode('normal');
            }}
            placeholder="Type a command (e.g. help)..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-syntax-grey/50"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="text-xs text-syntax-grey font-mono ml-auto">[ESC] to cancel</span>
        </div>
      </div>
    </div>
  )
}

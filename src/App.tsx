import {useEffect, useState} from 'react';
import {CHARSETS, generatePassword} from './lib/password';
import type {CharsetName} from './lib/password';
import './App.css';

const PASSWORD_COUNT = 6;
const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 20;

const CHARSET_NAMES = Object.keys(CHARSETS) as CharsetName[];

const CHARSET_LABELS: Record<CharsetName, string> = {
  lowercase: 'Lowercase (a–z)',
  uppercase: 'Uppercase (A–Z)',
  digits: 'Digits (0–9)',
  symbols: 'Special characters (!@#$…)',
};

const DEFAULT_CHARSETS: Record<CharsetName, boolean> = {
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
};

function selectedCharsets(enabled: Record<CharsetName, boolean>): CharsetName[] {
  return CHARSET_NAMES.filter((name) => enabled[name]);
}

function generateBatch(length: number, enabled: Record<CharsetName, boolean>): string[] {
  const charsets = selectedCharsets(enabled);
  return Array.from({length: PASSWORD_COUNT}, () => generatePassword({length, charsets}));
}

export function App() {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [enabledCharsets, setEnabledCharsets] = useState(DEFAULT_CHARSETS);
  const [passwords, setPasswords] = useState(() => generateBatch(DEFAULT_LENGTH, DEFAULT_CHARSETS));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const charsets = selectedCharsets(enabledCharsets);

  useEffect(() => {
    setPasswords(generateBatch(length, enabledCharsets));
  }, [length, enabledCharsets]);

  const toggleCharset = (name: CharsetName) => {
    setEnabledCharsets((current) => ({...current, [name]: !current[name]}));
  };

  const copyPassword = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 1500);
    } catch (error) {
      console.error('Copying to clipboard failed:', error);
    }
  };

  return (
    <main className="card">
      <h1>Password Generator</h1>
      <p className="subtitle">Random passwords, generated locally in your browser with a secure random source.</p>

      <section className="controls">
        <fieldset>
          <legend>Characters</legend>
          {CHARSET_NAMES.map((name) => (
            <label key={name} className="checkbox">
              <input type="checkbox" checked={enabledCharsets[name]} onChange={() => toggleCharset(name)} />
              {CHARSET_LABELS[name]}
            </label>
          ))}
        </fieldset>

        <label className="length-label" htmlFor="length">
          Length: <strong>{length}</strong> characters
        </label>
        <input
          id="length"
          type="range"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          value={length}
          onChange={(event) => setLength(Number(event.target.value))}
        />
      </section>

      {charsets.length === 0 ? (
        <p className="hint">Select at least one character set.</p>
      ) : (
        <ul className="passwords">
          {passwords.map((password, index) => (
            <li key={index}>
              <button
                type="button"
                className="password-row"
                title="Copy to clipboard"
                onClick={() => void copyPassword(password, index)}
              >
                <code>{password}</code>
                <span className={`copy-feedback${copiedIndex === index ? ' copied' : ''}`} aria-live="polite">
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="regenerate"
        onClick={() => setPasswords(generateBatch(length, enabledCharsets))}
      >
        ↻ Regenerate
      </button>

      <footer>Built by Benny Neugebauer · Nothing leaves your browser.</footer>
    </main>
  );
}

export default App;

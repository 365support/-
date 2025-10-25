import React, { useState, useCallback, useMemo } from 'react';

const MAX_PHRASE_LENGTH = 20;
const MAX_PHRASE_COUNT = 50;

// SVG Icons defined as components for reusability.
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375-3.375-3.375m0 0A9.06 9.06 0 0 1 12.75 5.25a9.06 9.06 0 0 1 2.25-1.033m-2.25 1.033c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);


// PhraseInput component defined outside the main App component to prevent re-creation on re-renders.
interface PhraseInputProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
}

const PhraseInput: React.FC<PhraseInputProps> = ({ index, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, e.target.value);
  };

  const charCountColor = value.length === MAX_PHRASE_LENGTH ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="space-y-2 animate-fade-in">
      <label htmlFor={`phrase-${index}`} className="block text-sm font-medium text-slate-300">
        문구 #{index + 1}
      </label>
      <div className="relative">
        <input
          id={`phrase-${index}`}
          type="text"
          value={value}
          onChange={handleInputChange}
          maxLength={MAX_PHRASE_LENGTH}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          placeholder="내용을 입력하세요..."
        />
        <div className={`absolute inset-y-0 right-0 pr-3 flex items-center text-xs pointer-events-none ${charCountColor}`}>
          {value.length}/{MAX_PHRASE_LENGTH}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [count, setCount] = useState<number>(3);
  const [phrases, setPhrases] = useState<string[]>(() => Array(3).fill(''));
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newCount = parseInt(e.target.value, 10);
    if (isNaN(newCount) || newCount < 1) {
      newCount = 1;
    }
    if (newCount > MAX_PHRASE_COUNT) {
      newCount = MAX_PHRASE_COUNT;
    }

    setCount(newCount);
    setPhrases(currentPhrases => {
      const currentLength = currentPhrases.length;
      if (newCount > currentLength) {
        return [...currentPhrases, ...Array(newCount - currentLength).fill('')];
      }
      return currentPhrases.slice(0, newCount);
    });
  };
  
  const handlePhraseChange = useCallback((index: number, value: string) => {
    setPhrases(currentPhrases => {
      const newPhrases = [...currentPhrases];
      newPhrases[index] = value;
      return newPhrases;
    });
  }, []);

  const handleCopyAll = useCallback(async () => {
    const textToCopy = phrases.filter(p => p.trim() !== '').join('\n');
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('클립보드 복사에 실패했습니다:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  }, [phrases]);
  
  const isCopyDisabled = useMemo(() => phrases.every(p => p.trim() === ''), [phrases]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 font-sans">
      <main className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 flex flex-col">
        <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">
            문구 복사기
            </h1>
            <p className="text-slate-400 text-center mb-8">원하는 문구를 입력하고 한번에 복사하세요.</p>
    
            <div className="mb-6">
                <label htmlFor="phrase-count" className="block text-sm font-medium text-slate-300 mb-2">
                문구 개수 (최대 {MAX_PHRASE_COUNT}개)
                </label>
                <input
                id="phrase-count"
                type="number"
                value={count}
                onChange={handleCountChange}
                min="1"
                max={MAX_PHRASE_COUNT}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
            </div>
    
            <div className="space-y-4 max-h-[calc(100vh-30rem)] md:max-h-80 overflow-y-auto pr-2">
                {phrases.map((phrase, index) => (
                    <PhraseInput 
                        key={index} 
                        index={index} 
                        value={phrase} 
                        onChange={handlePhraseChange} 
                    />
                ))}
            </div>
        </div>
        
        <div className="mt-auto p-6 md:p-8 bg-slate-800/30 border-t border-slate-700 rounded-b-2xl">
          <button
            onClick={handleCopyAll}
            disabled={isCopyDisabled}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800
              ${isCopyDisabled 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20'
              }`}
          >
            {copySuccess ? (
                <>
                    <CheckIcon className="w-6 h-6" />
                    <span>복사 완료!</span>
                </>
            ) : (
                <>
                    <CopyIcon className="w-6 h-6" />
                    <span>전체 복사하기</span>
                </>
            )}
          </button>
        </div>
      </main>
      <footer className="text-center mt-6 text-slate-500 text-sm">
        <p>Gemini를 사용하여 제작되었습니다.</p>
      </footer>
    </div>
  );
}

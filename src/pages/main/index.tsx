import { useState, useEffect, useRef } from 'react';
import { embedMessage, extractMessage } from './steganography';

export default function App() {
    const [username, setUsername] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [extracted, setExtracted] = useState('');
    const embeddedRef = useRef<HTMLAudioElement>(null);
    const originalRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        setOriginalUrl('/input.wav');
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z]*$/.test(value)) {
            setUsername(value);
        }
    };

    const handleLogin = () => {
        if (username.trim()) setLoggedIn(true);
    };

    const handleEmbed = async () => {
        const res = await fetch('/input.wav');
        const buffer = await res.arrayBuffer();
        const originalData = new Uint8Array(buffer);

        const embedded = embedMessage(originalData, username);
        const blob = new Blob([embedded], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        setAudioUrl(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${username}_embedded.wav`;
        a.click();
    };

    const handleExtractFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;
            const data = new Uint8Array(buffer);
            const hidden = extractMessage(data);
            setExtracted(hidden);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center">오디오 스테가노그래피</h1>

            {!loggedIn ? (
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="영문 아이디 입력"
                        value={username}
                        onChange={handleUsernameChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                        onClick={handleLogin}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        로그인
                    </button>
                    <p>Made. 김수윤</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-green-600 font-semibold">{username} 님으로 로그인됨</p>

                    <div>
                        <h3 className="font-semibold mb-1">원본 오디오 미리 듣기</h3>
                        <audio ref={originalRef} controls src={originalUrl ?? ''} className="w-full" />
                    </div>

                    <div>
                        <button
                            onClick={handleEmbed}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                            아이디 삽입 후 다운로드
                        </button>
                    </div>

                    {audioUrl && (
                        <div>
                            <h3 className="font-semibold mb-1">삽입된 오디오 미리 듣기</h3>
                            <audio ref={embeddedRef} controls src={audioUrl} className="w-full" />
                        </div>
                    )}

                    <div>
                        <label className="font-semibold">숨겨진 메시지 추출 (파일 선택):</label>
                        <input type="file" accept=".wav" onChange={handleExtractFromFile} className="block mt-1" />
                    </div>

                    {extracted && (
                        <div className="bg-gray-100 p-4 rounded">
                            <p className="font-semibold">추출된 메시지:</p>
                            <pre className="text-sm font-mono text-blue-800">{extracted}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

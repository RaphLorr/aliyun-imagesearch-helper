
import React, { useState, useRef, useMemo } from 'react';
import { Upload, Focus, Maximize2, Sparkles, Trash2, Copy, Check, Lock, X, AlertCircle } from 'lucide-react';
import ImageCanvas from './components/ImageCanvas';
import { BoundingBox, ImageData } from './types';
import { detectObjects } from './services/geminiService';

const AUTH_HASH = "c864cc2191c8f57ad0719e25b6256f30";

const md5 = (string: string) => {
  function rotateLeft(l: number, s: number) { return (l << s) | (l >>> (32 - s)); }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = (lX & 0x80000000); const lY8 = (lY & 0x80000000); const lX4 = (lX & 0x40000000); const lY4 = (lY & 0x40000000);
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) return (lResult & 0x40000000) ? (lResult ^ 0xC0000000 ^ lX8 ^ lY8) : (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    return (lResult ^ lX8 ^ lY8);
  }
  function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
  function H(x: number, y: number, z: number) { return (x ^ y ^ z); }
  function I(x: number, y: number, z: number) { return (y ^ (x | (~z))); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b);
  }
  const x = ((str: string) => {
    const lMessageLength = str.length; const lNumberOfWords = (((lMessageLength + 8) - ((lMessageLength + 8) % 64)) / 64 + 1) * 16; const lWordArray = Array(lNumberOfWords).fill(0);
    for (let i = 0; i < lMessageLength; i++) lWordArray[i >> 2] |= (str.charCodeAt(i) << ((i % 4) * 8));
    lWordArray[lMessageLength >> 2] |= (0x80 << ((lMessageLength % 4) * 8)); lWordArray[lNumberOfWords - 2] = lMessageLength << 3; return lWordArray;
  })(string);
  let a = 0x67452301; let b = 0xEFCDAB89; let c = 0x98BADCFE; let d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a; const BB = b; const CC = c; const DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB); b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613); b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8); d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122); d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E); b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340); c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], 9, 0x02441453); c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681); c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], 23, 0x04881D05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xF4292244); d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97); c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3); d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], 15, 0xA3014314); b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82); d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);
    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }
  const hex = (n: number) => { let s = ""; for (let i = 0; i < 4; i++) { const v = (n >>> (i * 8)) & 255; s += ("0" + v.toString(16)).slice(-2); } return s; };
  return hex(a) + hex(b) + hex(c) + hex(d);
};

export const App: React.FC = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [manualInput, setManualInput] = useState('{\n  "region": "263,603,364,691"\n}');
  const [isNormalized, setIsNormalized] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 强力解析器：支持 JSON 键值对提取和原始数值提取
  const parsedBoxes = useMemo(() => {
    const lines = manualInput.split('\n');
    const boxes: BoundingBox[] = [];
    
    lines.forEach(line => {
      let content = line.trim();
      if (!content) return;

      // 尝试匹配 "region": "x1,x2,y1,y2" 模式
      const regionMatch = content.match(/"region"\s*:\s*"([^"]+)"/);
      if (regionMatch) {
        content = regionMatch[1];
      }

      // 提取所有数字，支持任何非数字字符分隔 (逗号, 空格, 引号等)
      const parts = content.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
      
      if (parts.length >= 4) {
        boxes.push({ 
          x1: parts[0], // Left
          x2: parts[1], // Right
          y1: parts[2], // Top
          y2: parts[3]  // Bottom
        });
      }
    });
    return boxes;
  }, [manualInput]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const img = new Image();
      img.onload = () => setImage({ url, width: img.width, height: img.height });
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const onAiClick = () => {
    if (isAuthenticated) {
      runDetection();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (md5(passcode) === AUTH_HASH) {
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      setAuthError(false);
      runDetection();
    } else {
      setAuthError(true);
    }
  };

  const runDetection = async () => {
    if (!image) {
      setError("请先上传图片");
      return;
    }
    setIsAiLoading(true);
    setError(null);
    try {
      const results = await detectObjects(image.url);
      const formatted = results.map(r => 
        `{\n  "region": "${Math.round(r.box.x1)},${Math.round(r.box.x2)},${Math.round(r.box.y1)},${Math.round(r.box.y2)}"\n}`
      ).join('\n');
      setManualInput(prev => prev ? prev + '\n' + formatted : formatted);
      setIsNormalized(true);
    } catch (err: any) {
      setError(err.message || "AI 检测失败");
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-96 bg-slate-900 border-b lg:border-r border-slate-800 p-6 flex flex-col h-auto lg:h-screen overflow-y-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
            <Focus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">Aliyun ImageSearch Helper</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Smart Coord Extractor</p>
          </div>
        </header>

        <section className="mb-6">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 underline decoration-blue-500/50 underline-offset-4">1. 图片上传</label>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full group flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-600 group-hover:text-blue-400" />
            <span className="text-sm font-medium text-slate-500">点击或拖拽上传</span>
          </button>
        </section>

        <section className="flex-1 flex flex-col mb-6 min-h-0">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">2. 坐标数据 (兼容模式)</label>
            <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700 shadow-xl">
              <button onClick={() => setIsNormalized(false)} className={`px-2 py-0.5 text-[10px] rounded transition-all ${!isNormalized ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>PX</button>
              <button onClick={() => setIsNormalized(true)} className={`px-2 py-0.5 text-[10px] rounded transition-all ${isNormalized ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>0-1000</button>
            </div>
          </div>
          
          <div className="relative flex-1 group min-h-[300px]">
            <textarea 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              spellCheck={false}
              placeholder='可直接粘贴: {"region": "x1,x2,y1,y2"}'
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-blue-100 placeholder-slate-800"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={copyToClipboard} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white shadow-lg">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => setManualInput('')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 shadow-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-600 font-mono italic flex justify-between items-center px-1">
            <span>支持 JSON 或 原始序列</span>
            <span className="text-blue-500/50">已识别: {parsedBoxes.length} 个区域</span>
          </div>
        </section>

        <section className="mt-auto">
          <button 
            onClick={onAiClick}
            disabled={isAiLoading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-xl active:scale-95 
              ${isAiLoading ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {isAiLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
            ) : (
              <>
                {isAuthenticated ? <Sparkles className="w-5 h-5 text-yellow-300" /> : <Lock className="w-5 h-5 opacity-40" />}
                <span>AI 智能识别物体</span>
              </>
            )}
          </button>
          {error && <p className="text-red-500 text-[10px] mt-2 text-center flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
        </section>
      </aside>

      <main className="flex-1 bg-slate-950 p-4 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-blue-500" /> 画布预览 (x1, x2, y1, y2)
            </h2>
            {image && (
              <div className="flex gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-3 py-1 rounded border border-slate-800">原图: {image.width}x{image.height}</span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-900/20 px-3 py-1 rounded border border-blue-800/30 font-bold uppercase tracking-tight">Parser: Active</span>
              </div>
            )}
          </div>
          
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900 min-h-[500px]">
            <ImageCanvas image={image} boxes={parsedBoxes} isNormalized={isNormalized} />
          </div>

          {parsedBoxes.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-500">
               {parsedBoxes.map((box, idx) => (
                 <div key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 group hover:border-blue-500/50 transition-all hover:bg-slate-900/80">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="w-5 h-5 bg-blue-600/20 text-blue-500 text-[10px] font-bold rounded flex items-center justify-center ring-1 ring-blue-500/20">#{idx + 1}</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Region Data</span>
                   </div>
                   <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">X1 (Left)</p>
                        <p className="text-xs font-mono text-blue-400">{box.x1}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">X2 (Right)</p>
                        <p className="text-xs font-mono text-blue-400">{box.x2}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Y1 (Top)</p>
                        <p className="text-xs font-mono text-green-400">{box.y1}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Y2 (Bottom)</p>
                        <p className="text-xs font-mono text-green-400">{box.y2}</p>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Lock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white">功能授权验证</h3>
              <p className="text-sm text-slate-500 mt-2">请输入 6 位授权码以解锁 AI 智能检测</p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <input 
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => {setPasscode(e.target.value); setAuthError(false);}}
                placeholder="••••••"
                className={`w-full bg-slate-950 border ${authError ? 'border-red-500 animate-shake' : 'border-slate-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-center tracking-[1em] text-lg font-bold`}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                解锁 AI 检测
              </button>
              {authError && <p className="text-red-500 text-xs text-center font-bold">验证码不正确，请重试</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

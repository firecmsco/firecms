import React, { useState, useEffect } from 'react';

const icons = {
    folder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    file: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    db: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>,
    add: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
    refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
    trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    more: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    dropdown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
};

const collectionsList = [
    'blog', 'books', 'crypto', 'ddd', 'item', 'pages', 'primary', 'products', 'showcase', 'tags', 'tickets', 'tttr'
];

const mockRows = [
    { id: 'B000P0MDMS', name: 'Baseball Cap', desc: 'This stylish baseball cap is made from **100% pig...' },
    { id: 'B000UO4KXY', name: 'Conceal invisible shelf', desc: 'The **Conceal Invisible Shelf** is a sleek and...' },
    { id: 'B000ZHY0JK', name: 'Aviator RB 3025', desc: 'Unisex Sunglasses, Gold, 58 mm. These iconic...' },
    { id: 'B0017TNJWY', name: 'Wine decanter', desc: 'This elegant wine decanter boasts a sophisticated design...' },
    { id: 'B001A793IW', name: 'Wobble Chess Set Walnut', desc: 'Discover the elegant and playful Wobble Chess...' },
    { id: 'B001DE7P7S', name: 'Pimentero', desc: 'This elegant pepper shaker is crafted from fin...' },
    { id: 'B001M8APXG', name: 'AAM32 1 Corkscrew', desc: 'This corkscrew is crafted from high-quality al...' },
    { id: 'B001UQ71F0', name: 'PREDATOR 2', desc: 'This package includes a protective case, ensur...' },
    { id: 'B002LAS086', name: 'Casio Collection', desc: 'Unisex Watch - Hour indication in 12 or 24-hou...' },
];

export default function FirestoreAdminDemo() {
    const [selectedDoc, setSelectedDoc] = useState('B0017TNJWY');
    const [docData, setDocData] = useState({
        name: 'Wine decanter',
        description: 'This elegant wine decanter boasts a sophisticated design with a robust oak stopper. With a generous capacity of 2 liters, it is perfect for aerating and serving your favorite wines. Ideal for both casual gatherings and formal dinner parties, it enhances the wine-drinking experience.',
        main_image: 'dadaki/B0017TNJWY-528977189.jpg',
        category: 'serveware',
        brand: 'Sagaform',
        amazon_link: 'https://www.amazon.es/gp/product/B0017TNJWY',
        currency: 'EUR'
    });

    const [focusedField, setFocusedField] = useState('');
    const [saveState, setSaveState] = useState('default'); // 'default', 'active', 'saved'

    useEffect(() => {
        let mounted = true;
        
        const typeText = async (text: string, setter: (val: string) => void, initialText: string = '') => {
            let current = initialText;
            for (let i = 0; i < text.length; i++) {
                if (!mounted) return;
                current += text[i];
                setter(current);
                await new Promise(r => setTimeout(r, Math.random() * 50 + 40));
            }
        };

        const deleteText = async (currentText: string, setter: (val: string) => void) => {
            let current = currentText;
            while (current.length > 0) {
                if (!mounted) return;
                current = current.slice(0, -1);
                setter(current);
                await new Promise(r => setTimeout(r, 20));
            }
        };

        const runAnimation = async () => {
            while (mounted) {
                // Doc 1
                setSelectedDoc('B0017TNJWY');
                setDocData({
                    name: 'Wine decanter',
                    description: 'This elegant wine decanter boasts a sophisticated design with a robust oak stopper. With a generous capacity of 2 liters, it is perfect for aerating and serving your favorite wines. Ideal for both casual gatherings and formal dinner parties, it enhances the wine-drinking experience.',
                    main_image: 'dadaki/B0017TNJWY-528977189.jpg',
                    category: 'serveware',
                    brand: 'Sagaform',
                    amazon_link: 'https://www.amazon.es/gp/product/B0017TNJWY',
                    currency: 'EUR'
                });
                setFocusedField('');
                setSaveState('default');
                await new Promise(r => setTimeout(r, 2000));
                if (!mounted) return;

                setFocusedField('brand');
                await new Promise(r => setTimeout(r, 500));
                if (!mounted) return;

                await deleteText('Sagaform', (v) => setDocData(d => ({...d, brand: v})));
                await new Promise(r => setTimeout(r, 200));
                if (!mounted) return;
                await typeText('Sagaform Premium', (v) => setDocData(d => ({...d, brand: v})));
                if (!mounted) return;
                
                await new Promise(r => setTimeout(r, 800));
                if (!mounted) return;
                
                setFocusedField('');
                setSaveState('active');
                await new Promise(r => setTimeout(r, 500));
                if (!mounted) return;
                
                setSaveState('saved');
                await new Promise(r => setTimeout(r, 1500));
                if (!mounted) return;

                // Doc 2
                setSelectedDoc('B000ZHY0JK');
                setDocData({
                    name: 'Aviator RB 3025',
                    description: 'Unisex Sunglasses, Gold, 58 mm. These iconic sunglasses, known for their timeless style and exceptional construction, are designed for those who value both aesthetic appeal and practical function.',
                    main_image: 'dadaki/B000ZHY0JK-2047853797.jpg',
                    category: 'sunglasses',
                    brand: 'Ray-Ban',
                    amazon_link: 'https://www.amazon.es/gp/product/B000ZHY0JK',
                    currency: 'EUR'
                });
                setSaveState('default');
                await new Promise(r => setTimeout(r, 2000));
                if (!mounted) return;

                setFocusedField('name');
                await new Promise(r => setTimeout(r, 500));
                if (!mounted) return;

                await deleteText('Aviator RB 3025', (v) => setDocData(d => ({...d, name: v})));
                await new Promise(r => setTimeout(r, 200));
                if (!mounted) return;
                await typeText('Aviator Classic Gold', (v) => setDocData(d => ({...d, name: v})));
                if (!mounted) return;

                await new Promise(r => setTimeout(r, 800));
                if (!mounted) return;

                setFocusedField('');
                setSaveState('active');
                await new Promise(r => setTimeout(r, 500));
                if (!mounted) return;

                setSaveState('saved');
                await new Promise(r => setTimeout(r, 2000));
                if (!mounted) return;
            }
        };

        runAnimation();

        return () => {
            mounted = false;
        };
    }, []);

    // Helper to get simulated row data for the left table
    const getRowName = (id: string) => {
        if (id === selectedDoc) return docData.name;
        return mockRows.find(r => r.id === id)?.name || '';
    };

    return (
        <div className="flex w-full bg-[#131416] text-[#e8eaed] rounded-xl overflow-hidden font-sans border border-[#2c2d30] shadow-2xl h-[700px] text-[13px] pointer-events-none select-none">
            
            {/* --- LEFT PANEL --- */}
            <div className="w-[200px] border-r border-[#2c2d30] flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 pt-5 pb-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2c2d30] rounded-md text-sm mb-6">
                        (default) {icons.dropdown}
                    </button>
                    <div className="text-[11px] font-semibold text-[#8a8a8e] mb-3 tracking-wider">
                        COLLECTIONS
                    </div>
                </div>
                
                <div className="flex flex-col">
                    {collectionsList.map(col => {
                        const isSelected = col === 'products';
                        return (
                            <div key={col} className="flex flex-col">
                                <div className={`flex items-center gap-3 px-4 py-1.5 ${isSelected ? 'bg-[#1a2b40] text-[#8ab4f8]' : ''}`}>
                                    <span className={isSelected ? 'text-[#8ab4f8]' : 'text-[#8a8a8e]'}>{col === 'products' ? <span style={{display: 'inline-block', fill: 'currentColor'}}>{icons.folder}</span> : icons.folder}</span>
                                    <span className="font-medium">{col}</span>
                                </div>
                                {isSelected && (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 pl-8 pr-4 py-1.5">
                                            <span className="text-[#8ab4f8]">{icons.file}</span>
                                            <span className="font-mono text-[12px]">{selectedDoc}</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-12 pr-4 py-1.5 text-[#8a8a8e]">
                                            {icons.folder} <span className="font-medium text-[13px] text-[#e8eaed]">__history</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-12 pr-4 py-1.5 text-[#8a8a8e]">
                                            {icons.folder} <span className="font-medium text-[13px] text-[#e8eaed]">locales</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-12 pr-4 py-1.5 text-[#8a8a8e] mt-1">
                                            <span className="text-[#8a8a8e]">{icons.add}</span> <span className="text-[12px]">Add subcollection</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- MIDDLE PANEL --- */}
            <div className="flex-1 border-r border-[#2c2d30] flex flex-col min-w-0 relative">
                {/* Active Row Highlight Overlay */}
                <div className="absolute top-[86px] left-0 right-0 h-[41px] bg-[#1a2b40]/30 z-0 pointer-events-none transition-all duration-300 ease-in-out" 
                     style={{
                         transform: `translateY(${mockRows.findIndex(r => r.id === selectedDoc) * 41}px)`
                     }}
                />

                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2c2d30] z-10 bg-[#131416]">
                    <div className="flex items-center gap-2">
                        <span className="text-[#8a8a8e] bg-[#2c2d30] w-6 h-6 rounded flex items-center justify-center font-bold text-xs italic">/</span>
                        <span className="text-[#8a8a8e]">{icons.dropdown}</span>
                        <span className="px-2 py-1 bg-[#1a2b40] text-[#8ab4f8] rounded-md text-[13px] font-medium">products</span>
                        <span className="px-2 py-1 bg-[#ffffff] text-[#000000] rounded-full text-[12px] font-medium ml-2">255 docs</span>
                        <span className="px-2 py-1 bg-[#1a2b40] text-[#8ab4f8] rounded-full text-[12px] font-medium ml-1">CMS: Products</span>
                    </div>
                    <div className="flex items-center gap-4 text-[#8a8a8e]">
                        <button>{icons.filter}</button>
                        <button>{icons.download}</button>
                        <button>{icons.history}</button>
                        <button>{icons.refresh}</button>
                        <button className="flex items-center gap-1 border border-[#8a8a8e] text-white px-3 py-1 rounded font-medium">
                            {icons.add} ADD
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden z-10 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#131416] z-20 border-b border-[#2c2d30] shadow-sm">
                            <tr>
                                <th className="w-10 px-4 py-3 text-[11px] font-semibold text-[#8a8a8e]"></th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-[#8a8a8e] uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-[#8a8a8e] uppercase tracking-wider">NAME</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-[#8a8a8e] uppercase tracking-wider">DESCRIPTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockRows.map(row => {
                                return (
                                    <tr key={row.id} className="border-b border-[#2c2d30]/50 h-[41px]">
                                        <td className="px-4">
                                            <div className="w-4 h-4 border border-[#5f6368] rounded bg-transparent"></div>
                                        </td>
                                        <td className="px-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[13px]">{row.id}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-[#2c2d30] rounded text-[#e8eaed] font-medium border border-[#4a4b4e]">CMS</span>
                                                <span className="text-[#8a8a8e]">{icons.file}</span>
                                                <span className="text-[#8a8a8e]">{icons.add}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 text-[#e8eaed] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                            {getRowName(row.id)}
                                        </td>
                                        <td className="px-4 text-[#8a8a8e] whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                                            {row.desc}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-[#2c2d30] text-[#8a8a8e] z-10 bg-[#131416]">
                    <span>Page 1 of 6</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">Rows: <button className="flex items-center gap-1 font-medium text-white px-2 py-1 rounded">50 {icons.dropdown}</button></span>
                        <div className="flex items-center gap-2">
                            <button className="p-1" style={{transform: 'rotate(90deg)'}}>{icons.dropdown}</button>
                            <button className="p-1" style={{transform: 'rotate(-90deg)'}}>{icons.dropdown}</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANEL --- */}
            <div className="w-[450px] flex flex-col shrink-0 relative overflow-hidden">
                <div className="p-4 border-b border-[#2c2d30] transition-opacity duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-medium tracking-tight text-white">{selectedDoc}</h2>
                        <button className="text-[#8a8a8e]">{icons.external}</button>
                    </div>
                    <div className="text-[12px] text-[#8a8a8e]">products/{selectedDoc}</div>
                    
                    <div className="flex items-center gap-4 mt-4 text-[13px] font-medium text-[#e8eaed]">
                        <span className="text-[#8a8a8e]">Subcollections:</span>
                        <button className="flex items-center gap-2 px-2 py-1 rounded">{icons.folder} __HISTORY</button>
                        <button className="flex items-center gap-2 px-2 py-1 rounded">{icons.folder} LOCALES</button>
                        <button className="px-1 py-1 rounded">{icons.add}</button>
                    </div>
                </div>

                <div className="flex border-b border-[#2c2d30]">
                    <button className="px-4 py-2 text-[#8ab4f8] font-medium border-b-2 border-[#8ab4f8] flex items-center gap-2">
                        <span className="text-[#8ab4f8] font-serif italic text-base leading-none pr-1">Tt</span> Fields <span className="bg-[#2c2d30] text-[#8a8a8e] px-1.5 rounded-full text-[11px]">26</span>
                    </button>
                    <button className="px-4 py-2 text-[#8a8a8e] font-medium flex items-center gap-2">
                        &lt;&gt; JSON
                    </button>
                    <button className="px-4 py-2 text-[#8a8a8e] font-medium flex items-center gap-2">
                        {icons.history} History
                    </button>
                    <button className="px-4 py-2 text-[#8a8a8e] font-medium flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Info
                    </button>
                </div>

                <div className="flex-1 overflow-hidden p-4 space-y-3 relative">
                    {/* Field Row: Name */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">name</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                readOnly
                                className={`w-full bg-[#1f2023] text-white border rounded px-3 py-2 outline-none transition-colors duration-300 ${focusedField === 'name' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.name}
                            />
                            {focusedField === 'name' && (
                                <div className="absolute right-3 top-2.5 w-[1px] h-[18px] bg-[#8ab4f8] animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    {/* Field Row: Description */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">description</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <textarea 
                                readOnly
                                className={`w-full bg-[#1f2023] text-[#e8eaed] border rounded px-3 py-2 min-h-[100px] outline-none transition-colors duration-300 resize-none leading-relaxed ${focusedField === 'description' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.description}
                            />
                        </div>
                    </div>

                    {/* Field Row: main_image */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">main_image</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                readOnly
                                className={`w-full bg-[#1f2023] text-white border rounded px-3 py-2 outline-none transition-colors duration-300 ${focusedField === 'main_image' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.main_image}
                            />
                        </div>
                    </div>

                    {/* Field Row: category */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">category</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                readOnly
                                className={`w-full bg-[#1f2023] text-[#e8eaed] border rounded px-3 py-2 outline-none transition-colors duration-300 ${focusedField === 'category' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.category}
                            />
                        </div>
                    </div>

                    {/* Field Row: brand */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">brand</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                readOnly
                                className={`w-full bg-[#1f2023] text-[#e8eaed] border rounded px-3 py-2 outline-none transition-colors duration-300 ${focusedField === 'brand' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.brand}
                            />
                            {focusedField === 'brand' && (
                                <div className="absolute right-3 top-2.5 w-[1px] h-[18px] bg-[#8ab4f8] animate-pulse"></div>
                            )}
                        </div>
                    </div>
                    
                    {/* Field Row: amazon_link */}
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-[100px] pt-2 font-medium break-all">amazon_link</div>
                        <button className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#1f2023] rounded-md border border-[#3c4043] w-[80px] text-[12px]">
                            String {icons.dropdown}
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                readOnly
                                className={`w-full bg-[#1f2023] text-[#e8eaed] border rounded px-3 py-2 outline-none transition-colors duration-300 ${focusedField === 'amazon_link' ? 'border-[#8ab4f8] shadow-[0_0_0_1px_#8ab4f8]' : 'border-[#3c4043]'}`}
                                value={docData.amazon_link}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[#2c2d30] flex items-center justify-between bg-[#1f2023] z-10">
                    <button className="p-2 text-[#8a8a8e]">
                        {icons.trash}
                    </button>
                    
                    <div className="relative">
                        <button className={`px-5 py-2 font-semibold rounded-md flex items-center gap-2 transition-all duration-500
                            ${saveState === 'default' ? 'bg-[#4a4b4e] text-[#8a8a8e]' : ''}
                            ${saveState === 'active' ? 'bg-[#8ab4f8] text-[#131416] shadow-[0_0_15px_rgba(138,180,248,0.5)] scale-105' : ''}
                            ${saveState === 'saved' ? 'bg-[#34a853] text-[#ffffff] scale-100' : ''}
                        `}>
                            {saveState === 'saved' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            )}
                            {saveState === 'saved' ? 'SAVED' : 'SAVE'}
                        </button>
                        
                        {/* Save ripple effect */}
                        {saveState === 'saved' && (
                            <div className="absolute inset-0 rounded-md bg-[#34a853] animate-ping opacity-20 pointer-events-none"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


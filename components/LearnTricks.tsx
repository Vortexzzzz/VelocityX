
import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Youtube, Loader2, PlayCircle } from 'lucide-react';
import { searchTrickTutorials } from '../services/geminiService';

interface LearnTricksProps {
    sport: string;
}

const LearnTricks: React.FC<LearnTricksProps> = ({ sport }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ summary: string, sources: { title: string, uri: string }[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await searchTrickTutorials(query, sport);
            setResult(data);
        } catch (err) {
            setError("Failed to find tutorials. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-black text-white mb-4">
                    Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Technique</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Search for any trick to get AI-powered step-by-step guides and top-rated video tutorials from across the web.
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative flex items-center bg-vx-panel border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                        <Search className="ml-6 text-gray-500" size={24} />
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`e.g., How to ${sport === 'Skateboard' ? 'Kickflip' : sport === 'Scooter' ? 'Tailwhip' : 'Backflip'}...`}
                            className="w-full bg-transparent text-white px-4 py-5 text-lg focus:outline-none placeholder-gray-600"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="mr-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {error && (
                <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400">
                    {error}
                </div>
            )}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    {/* AI Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-vx-panel border border-gray-800 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Step-by-Step Guide</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                {result.summary.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Video/Link Resources */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Youtube className="text-red-500" /> Recommended Tutorials
                        </h3>
                        <div className="space-y-4">
                            {result.sources.length === 0 ? (
                                <div className="text-gray-500 italic">No direct links found.</div>
                            ) : (
                                result.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/50 p-4 rounded-xl transition-all group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="bg-gray-800 group-hover:bg-cyan-500/20 p-2 rounded-lg text-gray-400 group-hover:text-cyan-400 transition-colors shrink-0">
                                                {source.uri.includes('youtube') ? <PlayCircle size={20} /> : <ExternalLink size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 line-clamp-2 mb-1 transition-colors">
                                                    {source.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 truncate">{new URL(source.uri).hostname}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!result && !loading && !error && (
                <div className="text-center py-20 opacity-30">
                    <BookOpen size={64} className="mx-auto mb-4" />
                    <p className="text-xl font-bold">Ready to Learn?</p>
                </div>
            )}
        </div>
    );
};

export default LearnTricks;

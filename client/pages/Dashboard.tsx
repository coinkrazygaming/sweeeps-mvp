import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles, Coins, Zap, Gift, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, accessToken, logout, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    const loadGames = async () => {
      try {
        const response = await fetch('/api/games');
        const data = await response.json();
        setGames(data.games?.slice(0, 6) || []);
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [user, accessToken, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="gradient-gold bg-clip-text text-transparent">FORTUNE</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link to="/games" className="text-slate-300 hover:text-white transition">
              Games
            </Link>
            <Link to="/store" className="text-slate-300 hover:text-white transition">
              Store
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-white transition">
              Profile
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, <span className="text-yellow-400">{user.username}</span>!
          </h1>
          <p className="text-slate-400 text-lg">Ready to test your luck? Play now and win big!</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Gold Coins */}
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-yellow-400/20 hover:border-yellow-400/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Gold Coins</h3>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-4xl font-bold text-yellow-400 mb-2">{user.goldCoins.toFixed(2)}</p>
            <p className="text-sm text-slate-500">For entertainment play</p>
            <Button className="w-full mt-4 gradient-gold text-slate-900 font-semibold hover:opacity-90">
              <Link to="/store">Buy Coins</Link>
            </Button>
          </div>

          {/* Sweepstakes Coins */}
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-purple-400/20 hover:border-purple-400/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Sweepstakes Coins</h3>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-purple-400 mb-2">{user.sweepstakesCoins.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Redeemable for prizes</p>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              <Link to="/profile">Redeem</Link>
            </Button>
          </div>

          {/* Daily Bonus */}
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-green-400/20 hover:border-green-400/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Daily Bonus</h3>
              <Gift className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">+25 SC</p>
            <p className="text-sm text-slate-500">Claim daily rewards</p>
            <Button
              onClick={() => refreshBalance()}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Claim Bonus
            </Button>
          </div>
        </div>

        {/* Featured Games */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Featured Games
            </h2>
            <Link to="/games" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              View All Games →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading games...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/games?gameId=${game.id}`}
                  className="group glass rounded-xl p-6 backdrop-blur-xl border border-white/10 hover:border-yellow-400/30 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">
                        {game.name}
                      </h3>
                      <p className="text-sm text-slate-400">{game.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">RTP: {game.rtpPercentage}%</span>
                    <span className="text-yellow-400 font-semibold group-hover:translate-x-1 transition">
                      Play →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/games"
            className="group glass rounded-xl p-8 backdrop-blur-xl border border-white/10 hover:border-yellow-400/30 transition"
          >
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition">
              Explore All Games
            </h3>
            <p className="text-slate-400">Discover 100+ casino games including slots, blackjack, roulette and more.</p>
          </Link>

          <Link
            to="/store"
            className="group glass rounded-xl p-8 backdrop-blur-xl border border-white/10 hover:border-yellow-400/30 transition"
          >
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition">
              Buy Gold Coins
            </h3>
            <p className="text-slate-400">Purchase Gold Coins to play more and get free Sweepstakes Coins!</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-500">
          <p>No Purchase Necessary • Responsible Gaming • 18+ Only</p>
          <p className="mt-2">
            This is a sweepstakes social casino. All games are for entertainment. Play responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}

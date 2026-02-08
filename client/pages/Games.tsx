import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { gamesAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft, Zap, Volume2 } from 'lucide-react';

export default function Games() {
  const { user, accessToken, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [currencyType, setCurrencyType] = useState<'GC' | 'SC'>('GC');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    const loadGames = async () => {
      try {
        const response = await gamesAPI.listGames();
        setGames(response.games || []);

        const gameId = searchParams.get('gameId');
        if (gameId) {
          const game = response.games?.find((g: any) => g.id === gameId);
          if (game) setSelectedGame(game);
        }
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [user, accessToken, navigate, searchParams]);

  const handlePlayGame = async () => {
    if (!selectedGame || !accessToken) return;

    // Check balance
    const balance = currencyType === 'GC' ? user!.goldCoins : user!.sweepstakesCoins;
    if (balance < betAmount) {
      alert('Insufficient balance!');
      return;
    }

    setPlaying(true);
    setGameResult(null);

    try {
      const result = await gamesAPI.playGame(
        accessToken,
        selectedGame.id,
        betAmount,
        currencyType
      );

      setGameResult(result);
      await refreshBalance();
    } catch (error) {
      console.error('Game error:', error);
      alert('Failed to play game');
    } finally {
      setPlaying(false);
    }
  };

  if (!user) return null;

  if (selectedGame && !gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedGame(null);
              setGameResult(null);
            }}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Games
          </button>

          {/* Game Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{selectedGame.name}</h1>
            <p className="text-slate-400">{selectedGame.description}</p>
            <p className="text-sm text-slate-500 mt-2">RTP: {selectedGame.rtpPercentage}%</p>
          </div>

          {/* Game Area */}
          <div className="glass rounded-2xl p-12 backdrop-blur-xl border border-white/10 mb-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Game Loading...</p>
              <p className="text-sm text-slate-500 mt-2">
                Full game graphics coming soon. Configure bet and play to see results!
              </p>
            </div>
          </div>

          {/* Betting Controls */}
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Balance */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Balance</h3>
                <div className="space-y-2">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-slate-400">Gold Coins</p>
                    <p className="text-2xl font-bold text-yellow-400">{user.goldCoins.toFixed(2)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-slate-400">Sweepstakes Coins</p>
                    <p className="text-2xl font-bold text-purple-400">{user.sweepstakesCoins.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Bet Controls */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Place Your Bet</h3>

                {/* Currency Selection */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setCurrencyType('GC')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      currencyType === 'GC'
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Gold Coins
                  </button>
                  <button
                    onClick={() => setCurrencyType('SC')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      currencyType === 'SC'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    SC
                  </button>
                </div>

                {/* Bet Amount */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Bet Amount</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(selectedGame.minBet, parseFloat(e.target.value) || 0))}
                    min={selectedGame.minBet}
                    max={selectedGame.maxBet}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Min: {selectedGame.minBet} | Max: {selectedGame.maxBet}
                  </p>
                </div>

                {/* Play Button */}
                <Button
                  onClick={handlePlayGame}
                  disabled={playing}
                  className="w-full gradient-gold text-slate-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {playing ? 'Playing...' : 'Play Game'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-12 backdrop-blur-xl border border-white/10 text-center">
            {gameResult.won ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-4xl font-bold text-yellow-400 mb-4">YOU WON!</h1>
                <p className="text-2xl text-white font-bold mb-8">
                  +{gameResult.winAmount.toFixed(2)} {currencyType === 'GC' ? 'Gold Coins' : 'Sweepstakes Coins'}
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💔</div>
                <h1 className="text-4xl font-bold text-slate-300 mb-4">No Win This Time</h1>
                <p className="text-xl text-slate-400 mb-8">Better luck next time!</p>
              </>
            )}

            <div className="glass rounded-lg p-6 mb-8 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Bet Amount</p>
                  <p className="text-2xl font-bold text-white">{gameResult.betAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Win Amount</p>
                  <p className="text-2xl font-bold text-yellow-400">{gameResult.winAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">New GC Balance</p>
                  <p className="text-xl font-bold text-yellow-400">{gameResult.newBalance.goldCoins.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">New SC Balance</p>
                  <p className="text-xl font-bold text-purple-400">{gameResult.newBalance.sweepstakesCoins.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setGameResult(null);
                }}
                className="flex-1 gradient-gold text-slate-900 font-bold py-3 rounded-lg hover:opacity-90"
              >
                Play Again
              </Button>
              <Button
                onClick={() => {
                  setSelectedGame(null);
                  setGameResult(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                Back to Games
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Browse Games</h1>
        <p className="text-slate-400 mb-8">Explore our collection of 100+ casino games</p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading games...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group glass rounded-xl p-6 backdrop-blur-xl border border-white/10 hover:border-yellow-400/30 transition text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">
                      {game.name}
                    </h3>
                    <p className="text-sm text-slate-400 capitalize">{game.category}</p>
                  </div>
                  <Play className="w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-sm text-slate-400 mb-4">{game.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>RTP: {game.rtpPercentage}%</span>
                  <span>Bet: {game.minBet.toFixed(0)}-{game.maxBet.toFixed(0)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

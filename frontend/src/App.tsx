import React from 'react';
import { WalletWatcher } from './components/WalletWatcher';
import { MainPage } from './components/MainPage';
import { useWalletStore } from './store/walletStore';

function App() {
  const { account, connect, error } = useWalletStore();

  return (
    <div className="App">
      <WalletWatcher />
      <header className="App-header">
        <h1>Simple Token DApp usage</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!account ? (
          <button onClick={connect}>Connect Wallet</button>
        ) : (
          <MainPage />
        )}
      </header>
    </div>
  );
}

export default App;

import React, { useState } from 'react';

const METHODS = [
  { id: 'paypal', name: 'PayPal', icon: '💳', minAmount: 1.00 },
  { id: 'cashapp', name: 'Cash App', icon: '💵', minAmount: 1.00 },
  { id: 'venmo', name: 'Venmo', icon: '📱', minAmount: 5.00 },
  { id: 'crypto_usdc', name: 'USDC', icon: '🪙', minAmount: 10.00 },
  { id: 'amazon', name: 'Amazon Gift Card', icon: '🎁', minAmount: 5.00 }
];

export default function CashoutFlow({ balance = 0, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!method || !amount || !destination) return;
    
    setProcessing(true);
    try {
      await onSubmit({
        method: method.id,
        amount: parseFloat(amount),
        destination
      });
      setStep(4); // Success
    } catch (error) {
      alert('Cashout failed: ' + error.message);
    }
    setProcessing(false);
  };

  const getDestinationLabel = () => {
    if (method?.id === 'paypal') return 'PayPal Email';
    if (method?.id === 'cashapp') return 'Cash App $cashtag';
    if (method?.id === 'venmo') return 'Venmo Username';
    if (method?.id === 'crypto_usdc') return 'USDC Wallet Address';
    if (method?.id === 'amazon') return 'Email for Gift Card';
    return 'Destination';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.close} onClick={onClose}>×</button>
        
        <h2 style={styles.title}>
          {step === 1 && 'Choose Method'}
          {step === 2 && 'Enter Amount'}
          {step === 3 && 'Confirm'}
          {step === 4 && 'Success!'}
        </h2>

        {step === 1 && (
          <div style={styles.methods}>
            {METHODS.map((m) => (
              <button
                key={m.id}
                style={{
                  ...styles.methodButton,
                  borderColor: method?.id === m.id ? '#00e676' : '#2a2a4a'
                }}
                onClick={() => { setMethod(m); setStep(2); }}
              >
                <span style={styles.methodIcon}>{m.icon}</span>
                <span>{m.name}</span>
                <span style={styles.methodMin}>Min ${m.minAmount}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={styles.form}>
            <div style={styles.balanceInfo}>
              Available: <strong>${balance.toFixed(2)}</strong>
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              min={method?.minAmount}
              max={balance}
              step="0.01"
            />
            <input
              type="text"
              placeholder={getDestinationLabel()}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={styles.input}
            />
            <button
              style={styles.continueButton}
              onClick={() => setStep(3)}
              disabled={!amount || !destination || parseFloat(amount) < method?.minAmount || parseFloat(amount) > balance}
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.confirm}>
            <div style={styles.confirmRow}>
              <span>Method</span>
              <span>{method?.icon} {method?.name}</span>
            </div>
            <div style={styles.confirmRow}>
              <span>Amount</span>
              <span>${parseFloat(amount).toFixed(2)}</span>
            </div>
            <div style={styles.confirmRow}>
              <span>To</span>
              <span>{destination}</span>
            </div>
            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm Cash Out'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={styles.success}>
            <span style={styles.successIcon}>✅</span>
            <p>Your cashout of ${parseFloat(amount).toFixed(2)} is being processed!</p>
            <button style={styles.doneButton} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    position: 'relative',
    border: '1px solid #2a2a4a'
  },
  close: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  methods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  methodButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: '#12122a',
    border: '2px solid #2a2a4a',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px'
  },
  methodIcon: {
    fontSize: '20px'
  },
  methodMin: {
    marginLeft: 'auto',
    color: '#888',
    fontSize: '12px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  balanceInfo: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '8px'
  },
  input: {
    padding: '14px',
    background: '#12122a',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px'
  },
  continueButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px'
  },
  confirm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  confirmRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: '#12122a',
    borderRadius: '8px',
    color: '#fff'
  },
  submitButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px'
  },
  success: {
    textAlign: 'center',
    padding: '20px 0'
  },
  successIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px'
  },
  doneButton: {
    padding: '12px 32px',
    background: '#00e676',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '16px'
  }
};

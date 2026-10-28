import React, { useState } from 'react';
import { colors } from '../colors.js';

const getRiskBand = (result) => {
  const riskLevel = String(result?.risk_level || '').toLowerCase();
  const score = Number(result?.risk_score ?? 0);

  if (riskLevel.includes('high') || score >= 70) {
    return 'high';
  }

  if (riskLevel.includes('medium') || score >= 35) {
    return 'medium';
  }

  return 'low';
};

const getRiskVisual = (band) => {
  if (band === 'low') {
    return {
      color: colors.emeraldGreen,
      label: 'Safe',
      pillBg: 'rgba(16, 185, 129, 0.14)',
      accent: 'rgba(16, 185, 129, 0.08)',
    };
  }

  if (band === 'medium') {
    return {
      color: colors.amberYellow,
      label: 'Warning',
      pillBg: 'rgba(245, 158, 11, 0.14)',
      accent: 'rgba(245, 158, 11, 0.08)',
    };
  }

  return {
    color: colors.crimsonRed,
    label: 'Blocked',
    pillBg: 'rgba(220, 38, 38, 0.14)',
    accent: 'rgba(220, 38, 38, 0.08)',
  };
};

function UserModeCheck({ apiUrl }) {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [transactionState, setTransactionState] = useState(null);

  const resetStates = () => {
    setError('');
    setTransactionState(null);
    setPendingResult(null);
    setShowWarningModal(false);
  };

  const amountValue = Number(amount);

  const handlePayNow = async () => {
    if (!accountId.trim()) {
      setError('Please enter a UPI ID or Account ID.');
      return;
    }

    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    resetStates();

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/user-mode/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId.trim(),
          amount: amountValue,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.detail || 'Payment request failed.');
      }

      const riskBand = getRiskBand(payload);
      const visual = getRiskVisual(riskBand);

      if (riskBand === 'low') {
        setTransactionState({
          band: riskBand,
          visual,
          title: 'Payment Successful',
          message: `₹${amountValue.toLocaleString('en-IN')} paid to ${payload.receiver_id}.`,
          details: payload,
        });
        return;
      }

      if (riskBand === 'medium') {
        setPendingResult(payload);
        setShowWarningModal(true);
        return;
      }

      setTransactionState({
        band: riskBand,
        visual,
        title: 'Transaction Blocked due to high fraud risk',
        message: payload.warning_message,
        details: payload,
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to process payment at the moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedPayment = () => {
    if (!pendingResult) {
      return;
    }

    setTransactionState({
      band: 'medium',
      visual: getRiskVisual('medium'),
      title: 'Payment Successful',
      message: `₹${amountValue.toLocaleString('en-IN')} paid to ${pendingResult.receiver_id} after confirmation.`,
      details: pendingResult,
    });
    setShowWarningModal(false);
    setPendingResult(null);
  };

  const handleCancelPayment = () => {
    setTransactionState({
      band: 'medium',
      visual: getRiskVisual('medium'),
      title: 'Payment Cancelled',
      message: 'The payment was cancelled based on risk warning.',
      details: pendingResult,
    });
    setShowWarningModal(false);
    setPendingResult(null);
  };

  return (
    <>
      <div
        className="backdrop-blur-sm border-2 rounded-3xl p-8 sm:p-12 shadow-lg"
        style={{
          backgroundColor: colors.softCream,
          borderColor: colors.mutedBlue,
          background: 'linear-gradient(140deg, rgba(90, 125, 154, 0.12) 0%, rgba(247, 243, 233, 0.92) 52%, rgba(16, 185, 129, 0.08) 100%)',
        }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black mb-2" style={{ color: colors.mutedBlue }}>
            Secure Payment
          </h2>
          <p className="text-sm" style={{ color: colors.darkSlateGray }}>
            Send money with real-time fraud safety checks in the background.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.mutedBlue }}>
              UPI ID / Account ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. xyz@upi or ACC_10239"
              className="w-full mt-2 rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.mutedBlue, color: colors.darkSlateGray }}
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.mutedBlue }}>
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mt-2 rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.mutedBlue, color: colors.darkSlateGray }}
            />
          </div>

          <button
            onClick={handlePayNow}
            disabled={loading}
            className="sm:col-span-3 rounded-xl px-4 py-3 text-white font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.mutedBlue }}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        {error && (
          <div
            className="mt-6 p-4 border-2 rounded-2xl text-sm font-semibold"
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderColor: colors.crimsonRed,
              color: colors.crimsonRed,
            }}
          >
            {error}
          </div>
        )}

        {transactionState && (
          <div
            className="mt-8 border-2 rounded-2xl p-6"
            style={{ borderColor: transactionState.visual.color, backgroundColor: transactionState.visual.accent }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: transactionState.visual.color }}
                aria-hidden="true"
              />
              <h3 className="text-xl font-black" style={{ color: transactionState.visual.color }}>
                {transactionState.title}
              </h3>
            </div>

            <p className="mt-3 text-sm font-semibold" style={{ color: colors.darkSlateGray }}>
              {transactionState.message}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div
                className="px-4 py-2 rounded-full text-sm font-black"
                style={{ color: transactionState.visual.color, backgroundColor: transactionState.visual.pillBg }}
              >
                {transactionState.band === 'low' ? 'Green: Safe' : transactionState.band === 'medium' ? 'Yellow: Warning' : 'Red: Blocked'}
              </div>
              <div
                className="px-4 py-2 rounded-full text-sm font-bold"
                style={{ color: transactionState.visual.color, border: `1px solid ${transactionState.visual.color}` }}
              >
                Risk Score: {transactionState.details?.risk_score ?? 0}/100
              </div>
            </div>

            {transactionState.band === 'high' && (
              <div
                className="mt-5 p-4 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: 'rgba(220, 38, 38, 0.12)', color: colors.crimsonRed }}
              >
                Transaction Blocked due to high fraud risk.
              </div>
            )}
          </div>
        )}
      </div>

      {showWarningModal && pendingResult && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl rounded-3xl border-2 shadow-2xl p-6 sm:p-8"
            style={{ backgroundColor: colors.softCream, borderColor: colors.amberYellow }}
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.amberYellow }} aria-hidden="true" />
              <h3 className="text-2xl font-black" style={{ color: colors.amberYellow }}>
                Warning: Medium Fraud Risk
              </h3>
            </div>

            <p className="mt-4 text-sm font-semibold" style={{ color: colors.darkSlateGray }}>
              This payment shows suspicious signals. Review before proceeding.
            </p>

            <ul className="mt-4 space-y-2 text-sm" style={{ color: colors.darkSlateGray }}>
              {(pendingResult.reasons || []).map((reason) => (
                <li key={reason}>- {reason}</li>
              ))}
            </ul>

            <div
              className="mt-4 p-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: colors.darkSlateGray }}
            >
              {pendingResult.warning_message}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleProceedPayment}
                className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: colors.amberYellow }}
              >
                Proceed
              </button>
              <button
                onClick={handleCancelPayment}
                className="px-5 py-2.5 rounded-xl font-bold border-2 transition-transform hover:scale-105"
                style={{ borderColor: colors.mutedBlue, color: colors.mutedBlue }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserModeCheck;

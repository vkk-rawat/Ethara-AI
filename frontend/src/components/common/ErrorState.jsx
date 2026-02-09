import "./ErrorState.css";

const ErrorState = ({ title = "Something went wrong", message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 8V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <button className="error-state-retry" onClick={onRetry}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 4V10H7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8823 16.3226 20.1401 17.81 18.8798C19.2974 17.6195 20.3349 15.9094 20.7674 14.0064C21.1999 12.1035 21.0046 10.1105 20.2106 8.32152C19.4166 6.53252 18.066 5.04145 16.3641 4.07537C14.6623 3.10928 12.7022 2.71978 10.7597 2.96427C8.81718 3.20876 7.0008 4.07378 5.56 5.44L1 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

export default function AuthLoading() {
  return (
    <div className="auth-root">
      {/* Left panel — decorative, kept blank during load */}
      <div className="auth-left" aria-hidden />

      {/* Right form panel skeleton */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Title + sub */}
          <div className="skeleton" style={{ height: 30, width: "55%", borderRadius: 8, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 16, width: "40%", borderRadius: 6, marginBottom: 32 }} />

          {/* Google button */}
          <div className="skeleton" style={{ height: 44, borderRadius: 10, marginBottom: 20 }} />

          {/* Divider */}
          <div className="skeleton" style={{ height: 1, marginBottom: 20 }} />

          {/* Email field */}
          <div className="skeleton" style={{ height: 14, width: 40, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 16 }} />

          {/* Password field */}
          <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 24 }} />

          {/* Submit button */}
          <div className="skeleton" style={{ height: 44, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

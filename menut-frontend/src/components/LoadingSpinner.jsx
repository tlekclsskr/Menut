export default function LoadingSpinner() {
    return (
        <div
            className="min-h-screen bg-shell flex flex-col items-center justify-center gap-3"
            role="status"
            aria-live="polite"
            aria-label="กำลังโหลด"
        >
            <div className="w-10 h-10 rounded-full border-4 border-card-border border-t-primary motion-safe:animate-spin" />
            <p className="text-sm text-text-muted">กำลังโหลด</p>
        </div>
    )
}

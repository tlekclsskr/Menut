export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-card-border border-t-primary animate-spin"></div>
            <p className="text-sm text-text-muted">กำลังโหลด</p>
        </div>
    )
}
'use client'

import Image from "next/image"
import { useAuth } from "@/src/hooks/useAuth"

export default function LandingPage() {

    useAuth({ redirectIfFound: true })

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center font-sans antialiased">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-12 md:py-0 md:px-16 gap-12 md:gap-8">
                
                <div className="w-full md:w-[60%] flex flex-col items-center md:items-start justify-center gap-8 text-center md:text-left">
                    <div className="w-72 md:w-96 flex justify-start">
                        <Image 
                            src="/menut-logo.png" 
                            alt="Menut"
                            width={1200}
                            height={400}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <h1 className="text-4xl md:text-5xl font-bold text-text-dark leading-tight text-balance">
                            Web application <br />
                            สำหรับคน <span className="text-primary">&quot;มีนัด&quot;</span>
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg font-normal leading-relaxed mt-1 text-pretty">
                            ไม่ต้องถามทีละคนอีกต่อไป<br/>
                            หาวันว่างร่วมกันได้ในคลิกเดียว
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 items-start mx-auto md:mx-0">
                        {[
                            { icon: '📅', text: 'มาร์ควันว่างของตัวเอง' },
                            { icon: '👥', text: 'เห็นวันว่างทุกคนในกลุ่ม' },
                            { icon: '✨', text: 'ไฮไลท์วันที่ทุกคนว่างพร้อมกัน' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-sm shadow-sm border border-white/40" aria-hidden="true">
                                    {item.icon}
                                </div>
                                <p className="text-text-dark text-base font-medium">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row gap-4 mt-2">
                        <a href="/register" className="bg-primary text-white px-6 py-3.5 rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary/30">
                            สมัครสมาชิกฟรี
                        </a>
                        <a href="/login" className="bg-white/70 text-primary px-8 py-3.5 rounded-xl font-medium border border-border-accent backdrop-blur-sm hover:bg-white transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary/30">
                            เข้าสู่ระบบ
                        </a>
                    </div>
                </div>

                <div className="w-full md:w-[40%] flex items-center justify-center md:justify-end">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 w-full max-w-70 shadow-xl shadow-purple-900/5" aria-hidden="true">
                        <div className="mb-5">
                            <p className="font-semibold text-text-dark text-sm flex items-center gap-1">
                                <span aria-hidden="true">🏖️</span> ทริปเชียงใหม่
                            </p>
                            <div className="flex gap-1 mt-2.5">
                                {['#7c6fcd','#f472b6','#34d399','#fbbf24'].map((c, i) => (
                                    <div key={i} style={{background: c}} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                        {['K','P','B','N'][i]}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
                                <div key={d} className="text-text-muted font-medium py-1">{d}</div>
                            ))}
                            {[null,2,3,4,5,6,7,8,'9','10',11,12,13,14,'15','16',17,'18',19,20,21,22,23,24,25,26,27,28,29,30].map((d, i) => (
                                <div key={i} className={`py-1.5 rounded-lg text-text-dark text-[11px] transition-colors
                                    ${d === '9' || d === '10' || d === '18' ? 'bg-available-me text-available-me-text font-semibold' : ''}
                                    ${d === '15' || d === '16' ? 'bg-available-all text-available-all-text font-semibold' : ''}
                                `}>
                                    {d || ''}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-5 pt-3 border-t border-white/30">
                            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                                <div className="w-3 h-3 rounded-md bg-available-me border border-card-border" />ว่างของฉัน
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                                <div className="w-3 h-3 rounded-md bg-available-all border border-primary-light" />ทุกคนว่าง
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

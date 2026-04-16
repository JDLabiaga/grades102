"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

interface StudentRecord {
  id: string;
  student_name: string;
  quiz: number;
  laboratory: number;
  assignment: number;
  attendance: number;
  major_exam: number;
  final_grade: number;
}

export default function Home() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState({
    quiz: { score: 0, total: 100 },
    lab: { score: 0, total: 100 },
    assign: { score: 0, total: 100 },
    atten: { score: 0, total: 100 },
    exam: { score: 0, total: 100 },
  });
  
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student2_grades') 
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecords((data as StudentRecord[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const getPercent = (part: { score: number; total: number }) => 
    (part.total > 0 ? (part.score / part.total) * 100 : 0);

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Name");
    const { error } = await supabase.from('student2_grades').insert([{ 
      student_name: name, 
      quiz: getPercent(scores.quiz), 
      laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), 
      attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    }]);
    if (error) alert("Error saving"); else { setName(''); fetchRecords(); }
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete this record?")) {
      const { error } = await supabase.from('student2_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Updated Header */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mb-8 text-white border-b-4 border-indigo-600">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Grades Academic Portal</h1>
          <p className="text-indigo-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Batch 102 • Finalized Database System</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Input Sidebar */}
          <div className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-md border border-slate-200 h-fit">
            <h3 className="text-sm font-black text-black uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
              Registration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Student Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-black"
                  placeholder="Full Name..."
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              {Object.keys(scores).map((k) => (
                <div key={k} className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{k} Scores</span>
                  <div className="flex items-center bg-white rounded-xl px-3 py-2 border-2 border-slate-100 focus-within:border-indigo-600 transition-all">
                    <input 
                      type="number" className="w-full bg-transparent text-left font-bold text-black outline-none"
                      placeholder="Score"
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})}
                    />
                    <span className="text-slate-300 font-black mx-2">/</span>
                    <input 
                      type="number" className="w-12 bg-transparent text-center font-black text-indigo-600 outline-none"
                      defaultValue={100}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addStudent}
                className="w-full bg-indigo-600 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest"
              >
                Save to Table
              </button>
            </div>
          </div>

          {/* Expanded Summary Table */}
          <div className="xl:col-span-3 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-black uppercase">Complete Grade Summary</h3>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Live Cloud Sync</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-black">Student Name</th>
                    <th className="px-4 py-4 text-center">Quiz</th>
                    <th className="px-4 py-4 text-center">Lab</th>
                    <th className="px-4 py-4 text-center">Assig</th>
                    <th className="px-4 py-4 text-center">Atten</th>
                    <th className="px-4 py-4 text-center">Exam</th>
                    <th className="px-6 py-4 text-center">Final %</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-black text-sm uppercase">{r.student_name}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.quiz?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.laboratory?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.assignment?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.attendance?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.major_exam?.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                          {r.final_grade?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteRecord(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Refreshing Database...</div>}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
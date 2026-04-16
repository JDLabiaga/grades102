"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

// Fixes the red errors in your screenshot
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

  const rawGrade = (
    (getPercent(scores.quiz) * 0.20) +
    (getPercent(scores.lab) * 0.30) +
    (getPercent(scores.assign) * 0.10) +
    (getPercent(scores.atten) * 0.10) +
    (getPercent(scores.exam) * 0.30)
  );

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

  return (
    <main className="min-h-screen bg-[#f0f2f5] p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* NEW HEADER: Gradient Glass Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl mb-8 text-white flex flex-col md:flex-row justify-between items-center border-b-4 border-indigo-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Student Batch B</h1>
            <p className="opacity-80 font-medium mt-1 uppercase tracking-widest text-xs">Section 102 • Academic Performance</p>
          </div>
          <div className="mt-6 md:mt-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center min-w-[160px]">
            <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Live Average</p>
            <p className="text-5xl font-black">{rawGrade.toFixed(1)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Entry Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
              Enter Details
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Student Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-semibold"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              {Object.keys(scores).map((k) => (
                <div key={k} className="flex justify-between items-center gap-4">
                  <span className="text-xs font-black text-slate-500 uppercase">{k}</span>
                  <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
                    <input 
                      type="number" className="w-12 bg-transparent text-center font-bold outline-none"
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})}
                    />
                    <span className="text-slate-400 mx-1">/</span>
                    <input 
                      type="number" className="w-12 bg-transparent text-center font-bold text-indigo-600 outline-none"
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addStudent}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
              >
                SUBMIT RECORD
              </button>
            </div>
          </div>

          {/* RIGHT: Data Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Database Records</h3>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {records.length} Students
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Score Avg</th>
                    <th className="px-6 py-4 text-center">Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm uppercase">{r.student_name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Recorded: {new Date().toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">Q:{r.quiz?.toFixed(0)}</span>
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">L:{r.laboratory?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-indigo-600">
                          {r.final_grade?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-10 text-center animate-pulse text-indigo-400 font-bold uppercase text-xs tracking-widest">Refreshing...</div>}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
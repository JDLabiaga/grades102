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
    <main className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-3xl p-8 shadow-2xl mb-8 text-white flex flex-col md:flex-row justify-between items-center border-b-8 border-indigo-900">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">STUDENT BATCH B</h1>
            <p className="opacity-90 font-bold mt-1 uppercase tracking-[0.2em] text-xs">Grades 102 • Academic Portal</p>
          </div>
          <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-tighter mb-1">Preview Grade</p>
            <p className="text-5xl font-black text-white">{rawGrade.toFixed(1)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-xl font-black text-black mb-6 uppercase tracking-tight">Input Data</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-black uppercase mb-2 block">Student Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-black"
                  placeholder="Type Name Here..."
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              {Object.keys(scores).map((k) => (
                <div key={k} className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-black text-black uppercase w-12">{k}</span>
                  <div className="flex items-center bg-white rounded-xl px-3 py-2 border-2 border-slate-100 focus-within:border-indigo-600 transition-all">
                    <input 
                      type="number" className="w-12 bg-transparent text-center font-bold text-black outline-none"
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})}
                    />
                    <span className="text-slate-300 font-black mx-1">/</span>
                    <input 
                      type="number" className="w-12 bg-transparent text-center font-black text-indigo-700 outline-none"
                      defaultValue={100}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addStudent}
                className="w-full mt-4 bg-indigo-700 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
              >
                Save Record
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-black uppercase tracking-tight">Cloud Database</h3>
              <span className="bg-indigo-700 text-white px-4 py-1 rounded-full text-[10px] font-black">
                {records.length} ENTRIES
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Summary</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-black text-sm uppercase leading-tight">{r.student_name}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-1">
                          <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-black">Q:{r.quiz?.toFixed(0)}</span>
                          <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-black">L:{r.laboratory?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-indigo-700">
                          {r.final_grade?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-20 text-center animate-pulse text-indigo-700 font-black uppercase text-[10px] tracking-widest">Syncing Data...</div>}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
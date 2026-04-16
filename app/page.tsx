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
        .from('student2_grades') // Targeted new table
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecords((data as StudentRecord[]) || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
    if (!name.trim()) return alert("Enter Student Name");
    
    const { error } = await supabase.from('student2_grades').insert([{ 
      student_name: name, 
      quiz: getPercent(scores.quiz), 
      laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), 
      attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    }]);

    if (error) {
      alert("Error saving. Ensure table 'student2_grades' exists in Supabase.");
    } else {
      setName('');
      fetchRecords();
    }
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete this record?")) {
      const { error } = await supabase.from('student2_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-200">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase">Grades 102 Portal</h1>
            <p className="text-blue-400 text-xs font-bold tracking-widest mt-1">NEW STUDENT BATCH</p>
          </div>
          <div className="bg-blue-600 px-10 py-5 rounded-2xl text-center">
            <span className="block text-[10px] font-black uppercase mb-1">Preview</span>
            <span className="text-5xl font-black">{rawGrade.toFixed(1)}</span>
          </div>
        </div>

        {/* The rest of the UI logic remains the same as grades101 */}
        <div className="p-8 text-center text-slate-400 italic">
          Ready for data entry into student2_grades table.
        </div>
      </div>
    </main>
  );
}
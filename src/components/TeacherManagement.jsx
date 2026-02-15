import React, { useState, useEffect } from 'react';
import { addTeacher, removeTeacher, updateTeacher, loadFromSupabase } from '../utils/dataManager';

const TeacherManagement = ({ data, onDataUpdate }) => {
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editName, setEditName] = useState('');

  // 데이터가 로드되면 첫 번째 학년 자동 선택
  useEffect(() => {
    if (data?.grades?.length > 0 && !selectedGradeId) {
      setSelectedGradeId(data.grades[0].gradeId);
    }
  }, [data, selectedGradeId]);

  // 학년이 변경되면 첫 번째 반 자동 선택
  useEffect(() => {
    if (selectedGradeId) {
      const grade = data.grades.find(g => g.gradeId === selectedGradeId);
      if (grade && grade.classes.length > 0) {
        setSelectedClassId(grade.classes[0].classId);
      } else {
        setSelectedClassId(null);
      }
    }
  }, [selectedGradeId, data]);

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim() || !selectedClassId) return;
    const success = await addTeacher(selectedClassId, newTeacherName);
    if (success) {
      setNewTeacherName('');
      const { data: newData } = await loadFromSupabase();
      if (newData) onDataUpdate(newData);
    } else {
      alert('교사 추가에 실패했습니다.');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const success = await removeTeacher(teacherId);
      if (success) {
        const { data: newData } = await loadFromSupabase();
        if (newData) onDataUpdate(newData);
      }
      else alert('삭제 실패');
    }
  };

  const startEditing = (teacher) => {
    setEditingTeacherId(teacher.teacherId);
    setEditName(teacher.name);
  };

  const saveEditing = async () => {
    if (!editName.trim()) return;
    const success = await updateTeacher(editingTeacherId, editName);
    if (success) {
      setEditingTeacherId(null);
      const { data: newData } = await loadFromSupabase();
      if (newData) onDataUpdate(newData);
    } else {
      alert('수정 실패');
    }
  };

  const selectedGrade = data?.grades?.find(g => g.gradeId === selectedGradeId);
  const selectedClass = selectedGrade?.classes?.find(c => c.classId === selectedClassId);

  return (
    <div className="teacher-management">
      <h3>교사 관리</h3>
      
      {/* 학년 선택 */}
      <div className="selector-group" style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>학년:</label>
        {data?.grades?.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => setSelectedGradeId(grade.gradeId)}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: selectedGradeId === grade.gradeId ? '#007AFF' : '#fff',
              color: selectedGradeId === grade.gradeId ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {grade.gradeName}
          </button>
        ))}
      </div>

      {/* 반 선택 */}
      {selectedGrade && (
        <div className="selector-group" style={{ marginBottom: '2rem' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>반:</label>
          {selectedGrade.classes.map(cls => (
            <button
              key={cls.classId}
              onClick={() => setSelectedClassId(cls.classId)}
              style={{
                padding: '8px 16px',
                marginRight: '8px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                background: selectedClassId === cls.classId ? '#34C759' : '#fff',
                color: selectedClassId === cls.classId ? '#fff' : '#333',
                cursor: 'pointer'
              }}
            >
              {cls.className}
            </button>
          ))}
        </div>
      )}

      {/* 교사 목록 및 추가 */}
      {selectedClass ? (
        <div className="list-container">
          <div className="input-group" style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="교사 이름 입력"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button onClick={handleAddTeacher} style={{ padding: '10px 20px', borderRadius: '8px', background: '#007AFF', color: 'white', border: 'none', cursor: 'pointer' }}>추가</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {selectedClass.teachers && selectedClass.teachers.map(teacher => (
              <li key={teacher.teacherId} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', background: 'white' }}>
                {editingTeacherId === teacher.teacherId ? (
                  <>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 1, padding: '5px', marginRight: '10px' }} />
                    <button onClick={saveEditing} style={{ marginRight: '5px', cursor: 'pointer' }}>저장</button>
                    <button onClick={() => setEditingTeacherId(null)} style={{ cursor: 'pointer' }}>취소</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{teacher.name}</span>
                    <button onClick={() => startEditing(teacher)} style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#f0f0f0', border: 'none', borderRadius: '4px' }}>수정</button>
                    <button onClick={() => handleRemoveTeacher(teacher.teacherId)} style={{ padding: '4px 8px', cursor: 'pointer', background: '#FF3B30', color: 'white', border: 'none', borderRadius: '4px' }}>삭제</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : <p>반을 선택해주세요.</p>}
    </div>
  );
};

export default TeacherManagement;
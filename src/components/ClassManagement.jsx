import React, { useState, useRef, useEffect } from 'react';
import { addClass, removeClass, updateClass, loadFromSupabase, searchTeachers } from '../utils/dataManager';

const ClassManagement = ({ data, onDataUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [targetGradeId, setTargetGradeId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [filterGradeId, setFilterGradeId] = useState('all');

  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  
  // 교사 검색 관련 상태
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // 외부 클릭 시 추천 목록 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const openAddModal = (gradeId) => {
    setModalMode('add');
    setTargetGradeId(gradeId);
    setClassName('');
    setTeacherName('');
    setSelectedTeacherId(null);
    setSuggestions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setModalMode('edit');
    setEditingClassId(cls.classId);
    setClassName(cls.className);
    setTeacherName(cls.teacherName || '');
    setSelectedTeacherId(cls.teacherId || null);
    setSuggestions([]);
    setIsModalOpen(true);
  };

  const handleTeacherNameChange = (e) => {
    const value = e.target.value;
    setTeacherName(value);
    setSelectedTeacherId(null); // 이름이 변경되면 기존 ID 선택 해제 (새로 검색 필요)

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length > 0) {
      searchTimeout.current = setTimeout(async () => {
        const results = await searchTeachers(value);
        setSuggestions(results);
        setShowSuggestions(true);
      }, 300); // 디바운싱 적용
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectTeacher = (teacher) => {
    setTeacherName(teacher.name);
    setSelectedTeacherId(teacher.id);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!className.trim()) {
      alert('반 이름을 입력해주세요.');
      return;
    }

    let finalTeacherId = selectedTeacherId;

    // 선생님 이름이 입력되었는데 ID가 없는 경우 (직접 입력 등) 검증
    if (teacherName.trim() && !finalTeacherId) {
      const results = await searchTeachers(teacherName.trim());
      const match = results.find(t => t.name === teacherName.trim());
      
      if (match) {
        finalTeacherId = match.id;
      } else {
        alert('등록되지 않은 선생님입니다. 목록에서 선택하거나 교사 관리에서 먼저 등록해주세요.');
        return;
      }
    } else if (!teacherName.trim()) {
      finalTeacherId = null;
    }

    let success = false;
    if (modalMode === 'add') {
      success = await addClass(targetGradeId, { className, teacherId: finalTeacherId });
    } else {
      success = await updateClass(editingClassId, { className, teacherId: finalTeacherId });
    }

    if (success) {
      setIsModalOpen(false);
      const { data: newData } = await loadFromSupabase();
      if (newData) onDataUpdate(newData);
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm('정말 이 반을 삭제하시겠습니까? 소속된 학생 정보도 함께 삭제될 수 있습니다.')) {
      const success = await removeClass(classId);
      if (success) {
        const { data: newData } = await loadFromSupabase();
        if (newData) onDataUpdate(newData);
      } else {
        alert('삭제 실패');
      }
    }
  };

  const filteredGrades = filterGradeId === 'all' 
    ? data?.grades 
    : data?.grades?.filter(g => g.gradeId === filterGradeId);

  return (
    <div className="class-management">
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setFilterGradeId('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            background: filterGradeId === 'all' ? '#333' : '#fff',
            color: filterGradeId === 'all' ? '#fff' : '#333',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          전체
        </button>
        {data?.grades?.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => setFilterGradeId(grade.gradeId)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: filterGradeId === grade.gradeId ? '#007AFF' : '#fff',
              color: filterGradeId === grade.gradeId ? '#fff' : '#333',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {grade.gradeName}
          </button>
        ))}
      </div>

      {filteredGrades?.map(grade => (
        <div key={grade.gradeId} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{grade.gradeName}</h3>
            <button 
              onClick={() => openAddModal(grade.gradeId)}
              style={{ padding: '6px 12px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              + 반 추가
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {grade.classes.map(cls => (
              <div key={cls.classId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{cls.className}</h4>
                <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
                  담임: {cls.teacherName || '미정'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(cls)} style={{ flex: 1, padding: '4px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                  <button onClick={() => handleDelete(cls.classId)} style={{ flex: 1, padding: '4px', background: '#FF3B30', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                </div>
              </div>
            ))}
            {grade.classes.length === 0 && <p style={{ color: '#999', fontSize: '0.9rem' }}>등록된 반이 없습니다.</p>}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3>{modalMode === 'add' ? '반 추가' : '반 정보 수정'}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>반 이름</label>
              <input 
                type="text" 
                value={className} 
                onChange={(e) => setClassName(e.target.value)}
                placeholder="예: 1반"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }} ref={wrapperRef}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>담임 선생님</label>
              <input 
                type="text" 
                value={teacherName} 
                onChange={handleTeacherNameChange}
                onFocus={() => teacherName && setShowSuggestions(true)}
                placeholder="이름을 입력하여 검색"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              {/* 검색 제안 목록 */}
              {showSuggestions && suggestions.length > 0 && (
                <ul style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  marginTop: '-1px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  listStyle: 'none',
                  padding: 0,
                  zIndex: 10,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {suggestions.map((teacher) => (
                    <li 
                      key={teacher.id}
                      onClick={() => selectTeacher(teacher)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={(e) => e.target.style.background = '#f9f9f9'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {teacher.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 16px', background: '#ddd', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '8px 16px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
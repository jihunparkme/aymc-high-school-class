import React, { useState, useRef, useEffect } from 'react';
import '../styles/ClassManagement.css';
import { addClass, removeClass, updateClass, loadFromSupabase, searchTeachers } from '../utils/dataManager';

const ClassManagement = ({ data, onDataUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [targetGradeId, setTargetGradeId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [filterGradeId, setFilterGradeId] = useState('all');

  const [className, setClassName] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState([]); // Array of {id, name}
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleFilterClick = (gradeId) => {
    if (filterGradeId === gradeId) {
      setFilterGradeId('all');
    } else {
      setFilterGradeId(gradeId);
    }
  };

  const openAddModal = (gradeId) => {
    setModalMode('add');
    setTargetGradeId(gradeId);
    setClassName('');
    setTeacherSearchTerm('');
    setSelectedTeachers([]);
    setSuggestions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setModalMode('edit');
    setEditingClassId(cls.classId);
    setClassName(cls.className);
    setTeacherSearchTerm('');
    
    if (cls.teacherIds && cls.teacherIds.length > 0) {
      const names = cls.teacherNames.split(', ');
      const teachers = cls.teacherIds.map((id, index) => ({
        id: id,
        name: names[index] || 'Unknown'
      }));
      setSelectedTeachers(teachers);
    } else {
      setSelectedTeachers([]);
    }
    
    setSuggestions([]);
    setIsModalOpen(true);
  };

  const handleTeacherSearchChange = (e) => {
    const value = e.target.value;
    setTeacherSearchTerm(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length > 0) {
      searchTimeout.current = setTimeout(async () => {
        const results = await searchTeachers(value);
        const filteredResults = results.filter(t => !selectedTeachers.some(st => st.id === t.id));
        setSuggestions(filteredResults);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addTeacher = (teacher) => {
    setSelectedTeachers([...selectedTeachers, teacher]);
    setTeacherSearchTerm('');
    setShowSuggestions(false);
  };

  const removeTeacher = (teacherId) => {
    setSelectedTeachers(selectedTeachers.filter(t => t.id !== teacherId));
  };

  const handleSave = async () => {
    if (!className.trim()) {
      alert('반 이름을 입력해주세요.');
      return;
    }

    if (modalMode === 'add') {
      const targetGrade = data.grades.find(g => g.gradeId === targetGradeId);
      if (targetGrade) {
        const isDuplicate = targetGrade.classes.some(c => c.className === className.trim());
        if (isDuplicate) {
          alert(`이미 '${className.trim()}'이(가) 존재합니다. 다른 이름을 입력해주세요.`);
          return;
        }
      }
    }

    const classData = { 
      className: className.trim(), 
      teacherIds: selectedTeachers.map(t => t.id),
      teacherNames: selectedTeachers.map(t => t.name).join(', ')
    };

    let success = false;
    if (modalMode === 'add') {
      success = await addClass(targetGradeId, classData);
    } else {
      success = await updateClass(editingClassId, classData);
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
      <div className="filter-container">
        {data?.grades?.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => handleFilterClick(grade.gradeId)}
            className={`filter-chip ${filterGradeId === grade.gradeId ? 'active' : ''}`}
          >
            {grade.gradeName}
          </button>
        ))}
      </div>

      {filteredGrades?.map(grade => (
        <div key={grade.gradeId} className="grade-card-section">
          <div className="grade-header">
            <h3>{grade.gradeName}</h3>
            <button 
              onClick={() => openAddModal(grade.gradeId)}
              className="btn-add-class"
            >
              + 반 추가
            </button>
          </div>
          
          <div className="class-grid">
            {grade.classes.map(cls => (
              <div key={cls.classId} className="class-item-card">
                <h4>{cls.className}</h4>
                <p>담임: {cls.teacherName || '미정'}</p>
                <div className="card-actions">
                  <button onClick={() => openEditModal(cls)} className="btn-card-edit">✏️</button>
                  <button onClick={() => handleDelete(cls.classId)} className="btn-card-delete">🗑️</button>
                </div>
              </div>
            ))}
            {grade.classes.length === 0 && <p className="empty-text">등록된 반이 없습니다.</p>}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === 'add' ? '반 추가' : '반 정보 수정'}</h3>
            
            <div className="form-group">
              <label>반 이름</label>
              <input 
                type="text" 
                value={className} 
                onChange={(e) => setClassName(e.target.value)}
                placeholder="예: 1반"
              />
            </div>

            <div className="form-group" ref={wrapperRef}>
              <label>담임 선생님</label>
              <div className="selected-teachers">
                {selectedTeachers.map(teacher => (
                  <span key={teacher.id} className="teacher-tag">
                    {teacher.name}
                    <button onClick={() => removeTeacher(teacher.id)} className="btn-remove-teacher">×</button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                value={teacherSearchTerm} 
                onChange={handleTeacherSearchChange}
                onFocus={() => teacherSearchTerm && setShowSuggestions(true)}
                placeholder="이름을 입력하여 검색"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((teacher) => (
                    <li 
                      key={teacher.id}
                      onClick={() => addTeacher(teacher)}
                    >
                      {teacher.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-modal-cancel"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                className="btn-modal-save"
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
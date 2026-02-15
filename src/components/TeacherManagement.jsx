import React, { useState } from 'react';
import '../styles/ClassManagement.css'; // Reusing styles for consistency
import { addTeacher, updateTeacher, removeTeacher, loadFromSupabase } from '../utils/dataManager';

const TeacherManagement = ({ data, onDataUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [teacherName, setTeacherName] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  const teachers = data?.teachers || [];

  const openAddModal = () => {
    setModalMode('add');
    setTeacherName('');
    setEditingTeacherId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setModalMode('edit');
    setEditingTeacherId(teacher.id);
    setTeacherName(teacher.name);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!teacherName.trim()) {
      alert('선생님 이름을 입력해주세요.');
      return;
    }

    let success = false;
    if (modalMode === 'add') {
      const newTeacher = await addTeacher(teacherName);
      success = !!newTeacher;
    } else {
      success = await updateTeacher(editingTeacherId, teacherName);
    }

    if (success) {
      setIsModalOpen(false);
      const { data: newData } = await loadFromSupabase();
      if (newData) onDataUpdate(newData);
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('정말 이 선생님을 삭제하시겠습니까? 담당하고 있는 반 정보에서 선생님 정보가 해제됩니다.')) {
      const success = await removeTeacher(teacherId);
      if (success) {
        const { data: newData } = await loadFromSupabase();
        if (newData) onDataUpdate(newData);
      } else {
        alert('삭제 실패');
      }
    }
  };

  return (
    <div className="class-management"> {/* Reusing class-management layout */}
      <div className="grade-card-section">
        <div className="grade-header">
          <h3>교사 목록 ({teachers.length}명)</h3>
          <button 
            onClick={openAddModal}
            className="btn-add-class"
          >
            + 교사 추가
          </button>
        </div>
        
        <div className="class-grid">
          {teachers.map(teacher => (
            <div key={teacher.id} className="class-item-card">
              <h4>{teacher.name}</h4>
              <div className="card-actions">
                <button onClick={() => openEditModal(teacher)} className="btn-card-edit">수정</button>
                <button onClick={() => handleDelete(teacher.id)} className="btn-card-delete">삭제</button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && <p className="empty-text">등록된 교사가 없습니다.</p>}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === 'add' ? '교사 추가' : '교사 정보 수정'}</h3>
            
            <div className="form-group">
              <label>선생님 이름</label>
              <input 
                type="text" 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="이름 입력"
                autoFocus
              />
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

export default TeacherManagement;
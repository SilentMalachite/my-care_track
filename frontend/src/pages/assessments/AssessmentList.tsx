import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentList as AssessmentListComponent } from '../../components/assessments/AssessmentList';
import { assessmentService } from '../../services/assessmentService';
import { clientService } from '../../services/clientService';
import { staffService } from '../../services/staffService';
import type { Assessment } from '../../types/assessment';
import type { Client } from '../../types/client';
import type { Staff } from '../../types/staff';

export function AssessmentList() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [clients, setClients] = useState<Record<number, { name: string }>>({});
  const [staff, setStaff] = useState<Record<number, { name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, clientsData, staffData] = await Promise.all([
        assessmentService.getAssessments(),
        clientService.getClients(),
        staffService.getStaff(),
      ]);

      setAssessments(assessmentsData);

      // クライアント情報をマップに変換
      const clientsMap: Record<number, { name: string }> = {};
      clientsData.forEach((client: Client) => {
        clientsMap[client.id] = { name: client.name };
      });
      setClients(clientsMap);

      // スタッフ情報をマップに変換
      const staffMap: Record<number, { name: string }> = {};
      staffData.forEach((staff: Staff) => {
        staffMap[staff.id] = { name: staff.name };
      });
      setStaff(staffMap);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assessmentService.deleteAssessment(id);
      await loadData();
    } catch (err) {
      console.error('削除に失敗しました', err);
    }
  };

  const handleStatusChange = async (ids: number[], status: Assessment['status']) => {
    try {
      await Promise.all(
        ids.map((id) => assessmentService.updateAssessment(id, { status }))
      );
      await loadData();
    } catch (err) {
      console.error('ステータス変更に失敗しました', err);
    }
  };

  const handleFinalize = async (id: number) => {
    try {
      await assessmentService.finalizeAssessment(id);
      await loadData();
    } catch (err) {
      console.error('承認に失敗しました', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AssessmentListComponent
        assessments={assessments}
        clients={clients}
        staff={staff}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onFinalize={handleFinalize}
      />
    </div>
  );
}
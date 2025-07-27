import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentForm } from '../../components/assessments/AssessmentForm';
import { assessmentService } from '../../services/assessmentService';
import { clientService } from '../../services/clientService';
import { supportPlanService } from '../../services/supportPlanService';
import { staffService } from '../../services/staffService';
import type { AssessmentFormData } from '../../types/assessment';
import type { Client } from '../../types/client';
import type { SupportPlan } from '../../types/supportPlan';
import type { Staff } from '../../types/staff';

export function AssessmentNew() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [staff, setStaff] = useState<Array<{ id: number; name: string }>>([]);
  const [supportPlans, setSupportPlans] = useState<Array<{ id: number; planName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, plansData, staffData] = await Promise.all([
        clientService.getClients(),
        supportPlanService.getSupportPlans(),
        staffService.getActiveStaff(),
      ]);

      setClients(
        clientsData.map((client: Client) => ({
          id: client.id,
          name: client.name,
        }))
      );

      setSupportPlans(
        plansData.map((plan: SupportPlan) => ({
          id: plan.id,
          planName: plan.planName,
        }))
      );

      setStaff(
        staffData.map((staff: Staff) => ({
          id: staff.id,
          name: staff.name,
        }))
      );
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AssessmentFormData) => {
    try {
      setSubmitting(true);
      const newAssessment = await assessmentService.createAssessment(data);
      navigate(`/assessments/${newAssessment.id}`);
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/assessments');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">評価・アセスメント新規作成</h1>
        <p className="mt-2 text-sm text-gray-600">
          クライアントの評価・アセスメントを新規作成します。
        </p>
      </div>

      <AssessmentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        clients={clients}
        staff={staff}
        supportPlans={supportPlans}
      />

      {submitting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-900">保存中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
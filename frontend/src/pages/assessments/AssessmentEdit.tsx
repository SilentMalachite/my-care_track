import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentForm } from '../../components/assessments/AssessmentForm';
import { assessmentService } from '../../services/assessmentService';
import { clientService } from '../../services/clientService';
import { supportPlanService } from '../../services/supportPlanService';
import type { Assessment, AssessmentFormData } from '../../types/assessment';
import type { Client } from '../../types/client';
import type { SupportPlan } from '../../types/supportPlan';

export function AssessmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [staff, setStaff] = useState<Array<{ id: number; name: string }>>([]);
  const [supportPlans, setSupportPlans] = useState<Array<{ id: number; planName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (assessmentId: number) => {
    try {
      setLoading(true);
      const [assessmentData, clientsData, plansData] = await Promise.all([
        assessmentService.getAssessmentById(assessmentId),
        clientService.getClients(),
        supportPlanService.getSupportPlans(),
      ]);

      setAssessment(assessmentData);

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

      // TODO: スタッフ情報も同様に取得
      setStaff([
        { id: 1, name: 'スタッフA' },
        { id: 2, name: 'スタッフB' },
        { id: 3, name: 'スタッフC' },
      ]);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AssessmentFormData, assessmentId?: number) => {
    if (!assessmentId) return;

    try {
      setSubmitting(true);
      await assessmentService.updateAssessment(assessmentId, data);
      navigate(`/assessments/${assessmentId}`);
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (assessment) {
      navigate(`/assessments/${assessment.id}`);
    } else {
      navigate('/assessments');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'データが見つかりません'}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">評価・アセスメント編集</h1>
        <p className="mt-2 text-sm text-gray-600">
          評価・アセスメントの内容を編集します。
        </p>
      </div>

      <AssessmentForm
        assessment={assessment}
        isEditMode
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
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentDetail as AssessmentDetailComponent } from '../../components/assessments/AssessmentDetail';
import { assessmentService } from '../../services/assessmentService';
import { clientService } from '../../services/clientService';
import { supportPlanService } from '../../services/supportPlanService';
import type { Assessment } from '../../types/assessment';
import type { Client } from '../../types/client';
import type { SupportPlan } from '../../types/supportPlan';

export function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [client, setClient] = useState<{ id: number; name: string } | null>(null);
  const [staff, setStaff] = useState<{ id: number; name: string } | null>(null);
  const [supportPlan, setSupportPlan] = useState<{ id: number; planName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (assessmentId: number) => {
    try {
      setLoading(true);
      const assessmentData = await assessmentService.getAssessmentById(assessmentId);
      setAssessment(assessmentData);

      // 関連データを取得
      const [clientData, planData] = await Promise.all([
        clientService.getClientById(assessmentData.clientId),
        assessmentData.supportPlanId
          ? supportPlanService.getSupportPlanById(assessmentData.supportPlanId)
          : Promise.resolve(null),
      ]);

      setClient({ id: clientData.id, name: clientData.name });
      if (planData) {
        setSupportPlan({ id: planData.id, planName: planData.planName });
      }

      // TODO: スタッフ情報も同様に取得
      setStaff({ id: assessmentData.staffId, name: 'スタッフA' });
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
      navigate('/assessments');
    } catch (err) {
      console.error('削除に失敗しました', err);
    }
  };

  const handleFinalize = async (id: number) => {
    try {
      await assessmentService.finalizeAssessment(id);
      if (assessment) {
        await loadData(assessment.id);
      }
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

  if (error || !assessment || !client || !staff) {
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
      <AssessmentDetailComponent
        assessment={assessment}
        client={client}
        staff={staff}
        supportPlan={supportPlan || undefined}
        onDelete={handleDelete}
        onFinalize={handleFinalize}
      />
    </div>
  );
}
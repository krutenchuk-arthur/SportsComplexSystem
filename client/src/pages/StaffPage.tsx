import { useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import TrainerTable from '../components/staff/TrainerTable';
import TrainerFormModal from '../components/staff/TrainerFormModal';
import AutoAssignModal from '../components/staff/AutoAssignModal';
import SkeletonTable from '../components/common/SkeletonTable';
import { useTrainers } from '../hooks/useTrainers';
import type { Trainer } from '../types/trainer';

export default function StaffPage() {
  const { trainers, loading, createTrainer, updateTrainer, deleteTrainer } = useTrainers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const handleAdd = () => {
    setEditingTrainer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Видалити тренера?')) {
      await deleteTrainer(id);
    }
  };

  const handleSubmit = async (dto: Parameters<typeof createTrainer>[0]) => {
    if (editingTrainer) {
      await updateTrainer(editingTrainer.id, dto);
    } else {
      await createTrainer(dto);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <PageHeader
          title="Персонал та балансування навантаження"
          subtitle="Контроль фактичної завантаженості тренерів відносно тижневого ліміту годин"
        />
        <div className="flex gap-3">
          <button
            onClick={() => setIsAutoAssignOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors"
          >
            <Wand2 size={16} />
            Автопідбір вільного тренера
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Додати тренера
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : (
        <TrainerTable trainers={trainers} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <TrainerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        trainer={editingTrainer}
      />

      <AutoAssignModal isOpen={isAutoAssignOpen} onClose={() => setIsAutoAssignOpen(false)} />
    </div>
  );
}

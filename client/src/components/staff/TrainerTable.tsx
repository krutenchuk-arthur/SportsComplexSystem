import { Pencil, Trash2, Phone } from 'lucide-react';
import type { Trainer } from '../../types/trainer';
import { SPECIALIZATION_LABELS } from '../../types/enums';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import { loadStatusToLevel } from '../../utils/statusColors';
import { formatMoney } from '../../utils/formatters';

interface TrainerTableProps {
  trainers: Trainer[];
  onEdit: (trainer: Trainer) => void;
  onDelete: (id: number) => void;
}

const LOAD_STATUS_LABELS: Record<string, string> = {
  Optimal: 'Оптимально',
  Warning: 'Наближення до ліміту',
  Critical: 'Перевантажений',
};

export default function TrainerTable({ trainers, onEdit, onDelete }: TrainerTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400">
            <th className="p-4 font-medium">ПІБ</th>
            <th className="p-4 font-medium">Спеціалізація</th>
            <th className="p-4 font-medium">Завантаженість</th>
            <th className="p-4 font-medium">Ставка / нараховано</th>
            <th className="p-4 font-medium">Статус</th>
            <th className="p-4 font-medium">Контакт</th>
            <th className="p-4 font-medium text-right">Дії</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
              <td className="p-4 text-zinc-900 dark:text-zinc-100 font-medium">{trainer.fullName}</td>
              <td className="p-4 text-zinc-700 dark:text-zinc-300">{SPECIALIZATION_LABELS[trainer.specialization]}</td>
              <td className="p-4 w-56">
                <ProgressBar value={trainer.assignedHours} max={trainer.maxWeeklyHours} showText />
              </td>
              <td className="p-4 font-mono text-xs whitespace-nowrap">
                <p className="text-zinc-900 dark:text-zinc-100">
                  {formatMoney(trainer.hourlyRate)}
                  <span className="text-zinc-400">/год</span>
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                  {formatMoney(trainer.hourlyRate * trainer.assignedHours)}
                </p>
              </td>
              <td className="p-4">
                <StatusBadge
                  label={LOAD_STATUS_LABELS[trainer.loadStatus]}
                  level={loadStatusToLevel(trainer.loadStatus)}
                />
              </td>
              <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                {trainer.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={12} /> {trainer.phoneNumber}
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(trainer)}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(trainer.id)}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

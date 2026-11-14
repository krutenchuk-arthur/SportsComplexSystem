import { Pencil, Trash2, Timer, MapPin } from 'lucide-react';
import type { Equipment } from '../../types/equipment';
import { EQUIPMENT_STATUS_LABELS, type EquipmentStatus } from '../../types/enums';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import { equipmentStatusToLevel } from '../../utils/statusColors';

interface EquipmentTableProps {
  equipment: Equipment[];
  onEdit?: (item: Equipment) => void;
  onDelete?: (id: number) => void;
  onAddUsage?: (item: Equipment) => void;
}

export default function EquipmentTable({ equipment, onEdit, onDelete, onAddUsage }: EquipmentTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400">
            <th className="p-4 font-medium">Інв. №</th>
            <th className="p-4 font-medium">Назва</th>
            <th className="p-4 font-medium">Локація</th>
            <th className="p-4 font-medium">Знос / ТО</th>
            <th className="p-4 font-medium">Статус</th>
            <th className="p-4 font-medium text-right">Дії</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
              <td className="p-4 font-mono text-xs text-rose-600 dark:text-rose-500">{item.inventoryNumber}</td>
              <td className="p-4 text-zinc-900 dark:text-zinc-100 font-medium">{item.name}</td>
              <td className="p-4 text-zinc-500 dark:text-zinc-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> {item.locationName}
                </span>
              </td>
              <td className="p-4 w-64">
                <ProgressBar
                  value={item.currentUsageHours}
                  max={item.maintenanceThresholdHours}
                  showText
                  label={`${item.wearPercentage.toFixed(0)}% до ТО`}
                />
              </td>
              <td className="p-4">
                <StatusBadge
                  label={EQUIPMENT_STATUS_LABELS[item.status as EquipmentStatus]}
                  level={equipmentStatusToLevel(item.status)}
                />
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  {onAddUsage && <button
                    onClick={() => onAddUsage(item)}
                    title="Нарахувати години використання"
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Timer size={16} />
                  </button>}
                  {onEdit && <button
                    onClick={() => onEdit(item)}
                    title="Редагувати"
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>}
                  {onDelete && <button
                    onClick={() => onDelete(item.id)}
                    title="Видалити"
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>}
                  {!onAddUsage && !onEdit && !onDelete && <span className="font-mono text-[10px] text-zinc-400">—</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

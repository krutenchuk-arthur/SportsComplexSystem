import { useState } from 'react';
import { Plus, Dumbbell, Wrench, AlertOctagon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import EquipmentTable from '../components/inventory/EquipmentTable';
import EquipmentFormModal from '../components/inventory/EquipmentFormModal';
import AddUsageHoursModal from '../components/inventory/AddUsageHoursModal';
import MaintenanceKanban from '../components/inventory/MaintenanceKanban';
import SkeletonTable from '../components/common/SkeletonTable';
import ReportIssueModal from '../components/inventory/ReportIssueModal';
import { maintenanceApi } from '../api/maintenanceApi';
import { useAuth } from '../context/AuthContext';
import { useEquipment } from '../hooks/useEquipment';
import { useMaintenance } from '../hooks/useMaintenance';
import { useLocations } from '../hooks/useLocations';
import { EQUIPMENT_STATUS_LABELS, type EquipmentStatus, type TicketStatus } from '../types/enums';
import type { Equipment, EquipmentCreateUpdate } from '../types/equipment';

type InventoryTab = 'equipment' | 'maintenance';

export default function InventoryPage() {
  const { equipment, loading, createEquipment, updateEquipment, deleteEquipment, addUsageHours, refresh: refreshEquipment } = useEquipment();
  const { tickets, loading: ticketsLoading, updateStatus, refresh: refreshTickets } = useMaintenance();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('Admin');
  const canService = hasRole('Admin', 'Technician');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { locations } = useLocations();

  const [activeTab, setActiveTab] = useState<InventoryTab>(() => (hasRole('Technician') ? 'maintenance' : 'equipment'));
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [usageItem, setUsageItem] = useState<Equipment | null>(null);

  const visibleEquipment = equipment.filter(
    (e) =>
      (locationFilter === 'all' || e.locationId === locationFilter) &&
      (statusFilter === 'all' || e.status === statusFilter)
  );

  const handleSubmit = async (dto: EquipmentCreateUpdate) => {
    if (editingItem) {
      await updateEquipment(editingItem.id, dto);
    } else {
      await createEquipment(dto);
    }
  };

  const handleUpdateTicketStatus = async (id: number, status: TicketStatus) => {
    await updateStatus(id, status);
    // статус обладнання змінюється на бекенді (UnderRepair / Operational, лічильник скидається)
    await refreshEquipment();
  };

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title="Облік інвентарю та технічного обслуговування"
          subtitle="Контроль напрацювання обладнання, порогів ТО та заявок на ремонт"
        />
        <div className="flex gap-2">
        {hasRole('Trainer') && (
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-600 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium text-sm transition-colors"
          >
            <AlertOctagon size={16} />
            Повідомити про поломку
          </button>
        )}
        {isAdmin && activeTab === 'equipment' && (
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Додати обладнання
          </button>
        )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'equipment'
              ? 'border-rose-600 text-rose-600 dark:text-rose-500'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Dumbbell size={16} /> Обладнання
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'maintenance'
              ? 'border-rose-600 text-rose-600 dark:text-rose-500'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Wrench size={16} /> Заявки на ТО
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {tickets.filter((t) => t.status !== 'Completed').length}
          </span>
        </button>
      </div>

      {activeTab === 'equipment' && (
        <>
          <div className="flex gap-3 mb-4">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
            >
              <option value="all">Усі локації</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'all')}
              className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
            >
              <option value="all">Усі статуси</option>
              {(Object.keys(EQUIPMENT_STATUS_LABELS) as EquipmentStatus[]).map((s) => (
                <option key={s} value={s}>{EQUIPMENT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <SkeletonTable rows={8} columns={6} />
          ) : (
            <EquipmentTable
              equipment={visibleEquipment}
              onEdit={isAdmin ? (item) => {
                setEditingItem(item);
                setIsFormOpen(true);
              } : undefined}
              onDelete={isAdmin ? async (id) => {
                if (confirm('Видалити обладнання?')) await deleteEquipment(id);
              } : undefined}
              onAddUsage={canService ? setUsageItem : undefined}
            />
          )}
        </>
      )}

      {activeTab === 'maintenance' &&
        (ticketsLoading ? (
          <SkeletonTable rows={3} columns={3} />
        ) : (
          <MaintenanceKanban tickets={tickets} onUpdateStatus={canService ? handleUpdateTicketStatus : undefined} />
        ))}

      <EquipmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        locations={locations}
        equipment={editingItem}
      />

      <ReportIssueModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        equipment={equipment}
        onSubmit={async (equipmentId, description) => {
          await maintenanceApi.create(equipmentId, description);
          await Promise.all([refreshTickets(), refreshEquipment()]);
          setActiveTab('maintenance');
        }}
      />

      <AddUsageHoursModal
        isOpen={usageItem !== null}
        onClose={() => setUsageItem(null)}
        onSubmit={addUsageHours}
        equipment={usageItem}
      />
    </div>
  );
}

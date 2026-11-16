import { useMemo, useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Link2, MapPin, QrCode } from 'lucide-react';
import Modal from '../common/Modal';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import type { Equipment } from '../../types/equipment';
import { EQUIPMENT_STATUS_LABELS, type EquipmentStatus } from '../../types/enums';
import { equipmentStatusToLevel } from '../../utils/statusColors';
import { formatHours } from '../../utils/formatters';

interface EquipmentPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

/** QR-посилання паспорта: ?equipmentId=<id> (навігація лишається state-based, без react-router) */
function buildPassportLink(equipmentId: number): string {
  const { origin, pathname, search } = window.location;
  const params = new URLSearchParams(search);
  params.set('equipmentId', String(equipmentId));
  return `${origin}${pathname}?${params.toString()}`;
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
    <span className="text-right text-sm text-zinc-900 dark:text-zinc-100 font-mono break-words">{children}</span>
  </div>
);

export default function EquipmentPassportModal({ isOpen, onClose, equipment }: EquipmentPassportModalProps) {
  const [copied, setCopied] = useState(false);

  const passportLink = useMemo(
    () => (equipment ? buildPassportLink(equipment.id) : ''),
    [equipment]
  );

  if (!equipment) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(passportLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // clipboard недоступний (http без https) — користувач скопіює вручну
      setCopied(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Паспорт обладнання" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4">
          <QRCodeSVG
            value={passportLink}
            size={168}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#18181b"
            aria-label={`QR-код паспорта ${equipment.inventoryNumber}`}
          />
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <QrCode size={11} /> Скануйте для швидкого доступу
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3">
          <Row label="Інв. номер">
            <span className="text-rose-600 dark:text-rose-500">{equipment.inventoryNumber}</span>
          </Row>
          <Row label="Назва">{equipment.name}</Row>
          <Row label="Локація">
            <span className="inline-flex items-center gap-1 font-sans">
              <MapPin size={11} /> {equipment.locationName}
            </span>
          </Row>
          <Row label="Статус">
            <StatusBadge
              label={EQUIPMENT_STATUS_LABELS[equipment.status as EquipmentStatus]}
              level={equipmentStatusToLevel(equipment.status)}
            />
          </Row>
          <Row label="Напрацювання">
            {formatHours(equipment.currentUsageHours)} / {formatHours(equipment.maintenanceThresholdHours)} год
          </Row>
        </div>

        <div>
          <ProgressBar
            value={equipment.currentUsageHours}
            max={equipment.maintenanceThresholdHours}
            showText
            label={`${equipment.wearPercentage.toFixed(0)}% до порогу ТО`}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Link2 size={11} /> Пряме посилання
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={passportLink}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
            <button
              type="button"
              onClick={handleCopy}
              title="Скопіювати посилання"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Готово' : 'Копіювати'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

import PageHeader from '../components/layout/PageHeader';
import AuditFeed from '../components/dashboard/AuditFeed';

/** Вкладка журналу аудиту (лише для ролі Admin). */
export default function AuditPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PageHeader
        title="Журнал аудиту"
        subtitle="Хто, що і коли змінював у системі — стрічка оновлюється в реальному часі"
      />
      <AuditFeed limit={80} />
    </div>
  );
}

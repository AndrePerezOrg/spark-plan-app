import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Header } from '@/components/layout/Header';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}
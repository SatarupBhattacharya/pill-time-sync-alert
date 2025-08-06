import { useMemo } from 'react';
import { Calendar, Clock, Pill, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PillHistoryEntry } from '@/types/pill-monitor';

interface DataHistoryProps {
  pillHistory: PillHistoryEntry[];
}

export const DataHistory = ({ pillHistory }: DataHistoryProps) => {
  const sortedHistory = useMemo(() => {
    return [...pillHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [pillHistory]);

  const stats = useMemo(() => {
    const totalTaken = pillHistory.filter(entry => entry.action === 'taken').length;
    const todayTaken = pillHistory.filter(entry => 
      entry.action === 'taken' && 
      new Date(entry.timestamp).toDateString() === new Date().toDateString()
    ).length;
    
    const medicineStats = pillHistory.reduce((acc, entry) => {
      if (entry.action === 'taken') {
        acc[entry.medicineName] = (acc[entry.medicineName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostTakenMedicine = Object.entries(medicineStats).sort(([,a], [,b]) => b - a)[0];

    return {
      totalTaken,
      todayTaken,
      mostTakenMedicine: mostTakenMedicine ? { name: mostTakenMedicine[0], count: mostTakenMedicine[1] } : null,
      totalMedicines: Object.keys(medicineStats).length
    };
  }, [pillHistory]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'taken':
        return <Pill className="h-4 w-4 text-green-500" />;
      case 'added':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'removed':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'count_updated':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = (entry: PillHistoryEntry) => {
    switch (entry.action) {
      case 'taken':
        return `Took ${entry.medicineName} (${entry.dose})`;
      case 'added':
        return `Added ${entry.medicineName} to ${entry.dose}`;
      case 'removed':
        return `Removed ${entry.medicineName} from ${entry.dose}`;
      case 'count_updated':
        return `Updated ${entry.medicineName} count: ${entry.oldCount} → ${entry.newCount}`;
      default:
        return `${entry.action} ${entry.medicineName}`;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'taken':
        return 'default';
      case 'added':
        return 'secondary';
      case 'removed':
        return 'destructive';
      case 'count_updated':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalTaken}</div>
            <div className="text-sm text-muted-foreground">Total Taken</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.todayTaken}</div>
            <div className="text-sm text-muted-foreground">Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalMedicines}</div>
            <div className="text-sm text-muted-foreground">Medicines</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-orange-600 truncate">
              {stats.mostTakenMedicine ? stats.mostTakenMedicine.name : 'None'}
            </div>
            <div className="text-sm text-muted-foreground">Most Taken</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm">Start taking your medicines to see your history here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sortedHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card/50">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getActionText(entry)}</span>
                      <Badge variant={getActionVariant(entry.action)} className="text-xs">
                        {entry.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
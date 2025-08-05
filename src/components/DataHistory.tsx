import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Pill, TrendingUp, Calendar } from 'lucide-react';
import { PillHistoryEntry } from '@/types/pill-monitor';

interface DataHistoryProps {
  pillHistory: PillHistoryEntry[];
}

export const DataHistory = ({ pillHistory }: DataHistoryProps) => {
  const sortedHistory = [...pillHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groupedByDate = sortedHistory.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, PillHistoryEntry[]>);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'taken': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'added': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'removed': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'taken': return '✓';
      case 'added': return '+';
      case 'removed': return '-';
      default: return '•';
    }
  };

  const getDoseIcon = (dose: string) => {
    switch (dose) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '💊';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMedicineStats = () => {
    const stats = pillHistory.reduce((acc, entry) => {
      if (!acc[entry.medicineName]) {
        acc[entry.medicineName] = { taken: 0, added: 0, removed: 0 };
      }
      if (entry.action === 'taken') {
        acc[entry.medicineName].taken += entry.count;
      } else if (entry.action === 'added') {
        acc[entry.medicineName].added += entry.count;
      } else if (entry.action === 'removed') {
        acc[entry.medicineName].removed += entry.count;
      }
      return acc;
    }, {} as Record<string, { taken: number; added: number; removed: number }>);

    return stats;
  };

  const medicineStats = getMedicineStats();

  if (pillHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pill history available</p>
            <p className="text-sm">Your medication activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Pill Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedByDate).map(([date, entries]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(date)}
                    </div>
                    <div className="space-y-2 ml-6">
                      {entries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{getDoseIcon(entry.dose)}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entry.medicineName}</span>
                                <Badge variant="outline" className={getActionColor(entry.action)}>
                                  {getActionIcon(entry.action)} {entry.action}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.count} pill{entry.count !== 1 ? 's' : ''} • {entry.dose}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(entry.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Medicine Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(medicineStats).map(([medicineName, stats]) => (
                  <Card key={medicineName} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          {medicineName}
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.taken}</div>
                          <div className="text-sm text-muted-foreground">Pills Taken</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.added}</div>
                          <div className="text-sm text-muted-foreground">Pills Added</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
                          <div className="text-sm text-muted-foreground">Pills Removed</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
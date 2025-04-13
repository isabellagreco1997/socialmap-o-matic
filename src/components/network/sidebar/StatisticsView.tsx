import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NetworkStats } from './types';

interface StatisticsViewProps {
  stats: NetworkStats;
}

export function StatisticsView({ stats }: StatisticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Networks</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{stats.totalNetworks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nodes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{stats.totalNodes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connections</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{stats.totalEdges}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Completion */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Task Completion</CardTitle>
          <CardDescription>
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Progress 
            value={stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0} 
            className="h-2"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {Math.round(stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0)}%
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.totalTasks - stats.completedTasks} remaining
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Node Types */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Node Types</CardTitle>
          <CardDescription>
            Distribution of different node types
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">People</span>
                <span className="text-sm font-medium">{stats.nodeTypes.person}</span>
              </div>
              <Progress value={(stats.nodeTypes.person / stats.totalNodes) * 100} className="h-2 bg-blue-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Organizations</span>
                <span className="text-sm font-medium">{stats.nodeTypes.organization}</span>
              </div>
              <Progress value={(stats.nodeTypes.organization / stats.totalNodes) * 100} className="h-2 bg-green-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Events</span>
                <span className="text-sm font-medium">{stats.nodeTypes.event}</span>
              </div>
              <Progress value={(stats.nodeTypes.event / stats.totalNodes) * 100} className="h-2 bg-pink-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Venues</span>
                <span className="text-sm font-medium">{stats.nodeTypes.venue}</span>
              </div>
              <Progress value={(stats.nodeTypes.venue / stats.totalNodes) * 100} className="h-2 bg-purple-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 